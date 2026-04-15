import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit, getRateLimitedResponse } from "../_shared/rate-limit.ts";
import { sanitizeString, sanitizeEmail, sanitizeBool, isValidNI } from "../_shared/sanitize.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Known DB columns we accept
const ALLOWED_COLUMNS = new Set([
  "candidate_name", "email", "contact_no", "address", "dob", "gender",
  "ni_number", "bank_name", "sort_code", "account_number", "beneficiary_name",
  "has_candidate_id", "right_to_work", "proof_of_address",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Rate limiting: 5 per 15 min per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit("submit-onboarding", ip, 5, 15 * 60 * 1000);
    if (rl.limited) return getRateLimitedResponse(corsHeaders);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required field
    const candidateName = sanitizeString(body.candidate_name, 200);
    if (!candidateName || candidateName.length < 2) {
      return new Response(
        JSON.stringify({ error: "A valid name is required (at least 2 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email if provided
    if (body.email) {
      const email = sanitizeEmail(body.email);
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Invalid email address" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate NI number if provided
    if (body.ni_number) {
      const ni = sanitizeString(body.ni_number, 20);
      if (!isValidNI(ni)) {
        return new Response(
          JSON.stringify({ error: "Invalid National Insurance number format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate sort code format if provided
    if (body.sort_code) {
      const sc = sanitizeString(body.sort_code, 10);
      if (!/^\d{2}-?\d{2}-?\d{2}$/.test(sc)) {
        return new Response(
          JSON.stringify({ error: "Invalid sort code format (e.g. 12-34-56)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate account number if provided
    if (body.account_number) {
      const an = sanitizeString(body.account_number, 10);
      if (!/^\d{7,8}$/.test(an)) {
        return new Response(
          JSON.stringify({ error: "Invalid account number (7-8 digits)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Honeypot check - if this field is filled, it's a bot
    if (body._hp_field) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Timing check - form submitted too fast (< 3 seconds)
    if (body._form_loaded_at) {
      const loadedAt = parseInt(String(body._form_loaded_at));
      if (!isNaN(loadedAt) && Date.now() - loadedAt < 3000) {
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate EMP ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const empId = `PC-${timestamp}-${random}`;

    // Build sanitized insert data - only allow known columns
    const insertData: Record<string, unknown> = {
      emp_id: empId,
      candidate_name: candidateName,
    };

    const booleanFields = new Set(["has_candidate_id", "right_to_work", "proof_of_address"]);

    for (const [key, value] of Object.entries(body)) {
      if (key === "candidate_name" || key.startsWith("_") || !ALLOWED_COLUMNS.has(key)) continue;

      if (booleanFields.has(key)) {
        insertData[key] = sanitizeBool(value);
      } else {
        const sanitized = sanitizeString(value, 500);
        if (sanitized) {
          insertData[key] = sanitized;
        }
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("candidates").insert(insertData);

    if (error) {
      console.error("Insert error:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to submit registration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emp_id: empId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
