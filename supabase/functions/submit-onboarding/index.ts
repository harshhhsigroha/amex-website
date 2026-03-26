import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiter (per IP, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max submissions per window
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Sanitize string input
function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>"'`;]/g, "") // remove dangerous chars
    .substring(0, 1000); // limit length
}

function sanitizeBool(value: unknown): boolean {
  return value === true || value === "true";
}

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

// Validate NI number format (UK)
function isValidNI(ni: string): boolean {
  if (!ni) return true; // optional
  return /^[A-Z]{2}\d{6}[A-D]$/i.test(ni.replace(/\s/g, ""));
}

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
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Validate required field
    const candidateName = sanitize(body.candidate_name);
    if (!candidateName || candidateName.length < 2) {
      return new Response(
        JSON.stringify({ error: "A valid name is required (at least 2 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email if provided
    if (body.email) {
      const email = sanitize(body.email);
      if (!isValidEmail(email)) {
        return new Response(
          JSON.stringify({ error: "Invalid email address" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate NI number if provided
    if (body.ni_number) {
      const ni = sanitize(body.ni_number);
      if (!isValidNI(ni)) {
        return new Response(
          JSON.stringify({ error: "Invalid National Insurance number format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Honeypot check - if this field is filled, it's a bot
    if (body._hp_field) {
      // Silently accept but don't save
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Timing check - form submitted too fast (< 3 seconds)
    if (body._form_loaded_at) {
      const loadedAt = parseInt(body._form_loaded_at);
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

    // Map fields to DB columns with sanitization
    const booleanFields = new Set(["has_candidate_id", "right_to_work", "proof_of_address"]);

    for (const [key, value] of Object.entries(body)) {
      if (key === "candidate_name" || key.startsWith("_") || !ALLOWED_COLUMNS.has(key)) continue;

      if (booleanFields.has(key)) {
        insertData[key] = sanitizeBool(value);
      } else {
        const sanitized = sanitize(value);
        if (sanitized) {
          insertData[key] = sanitized;
        }
      }
    }

    // Use service role to insert (bypasses RLS)
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
