import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit, getRateLimitedResponse } from "../_shared/rate-limit.ts";
import { sanitizeEmail, sanitizeString, validatePassword } from "../_shared/sanitize.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Candidate self-registration.
 * The candidate must already exist in the `candidates` table with a matching email
 * (case-insensitive). Their emp_id is verified against the candidate record.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit("candidate-self-register", ip, 5, 15 * 60 * 1000);
    if (rl.limited) return getRateLimitedResponse(corsHeaders);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Honeypot
    if (typeof body._hp_field === "string" && body._hp_field.length > 0) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = sanitizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    const empId = sanitizeString(body.empId, 50);
    const fullName = sanitizeString(body.fullName, 200);

    if (!email) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!empId) {
      return new Response(JSON.stringify({ error: "Employee ID is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return new Response(JSON.stringify({ error: pwCheck.error }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find matching candidate (must match emp_id AND email, case-insensitive)
    const { data: candidate, error: candErr } = await admin
      .from("candidates")
      .select("id, emp_id, candidate_name, email")
      .eq("emp_id", empId)
      .maybeSingle();

    if (candErr || !candidate) {
      return new Response(JSON.stringify({ error: "No candidate record matches that Employee ID. Please contact your administrator." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!candidate.email || candidate.email.trim().toLowerCase() !== email) {
      return new Response(JSON.stringify({ error: "Email does not match the email on file for that Employee ID." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure no existing candidate_users link
    const { data: existingLink } = await admin
      .from("candidate_users")
      .select("id")
      .eq("candidate_id", candidate.id)
      .maybeSingle();
    if (existingLink) {
      return new Response(JSON.stringify({ error: "A login already exists for this Employee ID. Please sign in instead." }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || candidate.candidate_name, candidate_emp_id: candidate.emp_id },
    });

    if (createErr || !created?.user) {
      const msg = createErr?.message || "";
      if (msg.toLowerCase().includes("already")) {
        return new Response(JSON.stringify({ error: "An account already exists with that email. Please sign in." }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: createErr?.message || "Could not create account" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = created.user.id;

    // Link to candidate
    const { error: linkErr } = await admin.from("candidate_users").insert({
      user_id: newUserId,
      candidate_id: candidate.id,
      emp_id: candidate.emp_id,
    });

    if (linkErr) {
      await admin.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: `Failed to link account: ${linkErr.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("profiles").upsert({
      id: newUserId,
      email,
      full_name: fullName || candidate.candidate_name,
    }, { onConflict: "id" });

    return new Response(
      JSON.stringify({ success: true, userId: newUserId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("candidate-self-register error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
