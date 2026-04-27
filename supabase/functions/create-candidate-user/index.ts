import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { rateLimit, getRateLimitedResponse } from "../_shared/rate-limit.ts";
import { sanitizeEmail, sanitizeString, isValidUUID, validatePassword } from "../_shared/sanitize.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Admin-only: create a candidate login for an existing candidate.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit("create-candidate-user", ip, 20, 15 * 60 * 1000);
    if (rl.limited) return getRateLimitedResponse(corsHeaders);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    let callerId: string;
    try {
      const [_h, payload] = decode(token);
      const claims = payload as { sub?: string; exp?: number };
      if (!claims.sub) throw new Error("missing sub");
      if (claims.exp && claims.exp * 1000 < Date.now()) {
        return new Response(JSON.stringify({ error: "Token expired" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      callerId = claims.sub;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin
    const { data: roleData } = await admin
      .from("user_roles").select("role").eq("user_id", callerId).maybeSingle();
    const isAdmin = roleData && ["super_admin", "admin"].includes(roleData.role);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const candidateId = String(body.candidateId || "");
    const email = sanitizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = sanitizeString(body.fullName, 200);

    if (!isValidUUID(candidateId)) {
      return new Response(JSON.stringify({ error: "Invalid candidate ID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return new Response(JSON.stringify({ error: pwCheck.error }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: candidate } = await admin
      .from("candidates")
      .select("id, emp_id, candidate_name")
      .eq("id", candidateId)
      .maybeSingle();
    if (!candidate) {
      return new Response(JSON.stringify({ error: "Candidate not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingLink } = await admin
      .from("candidate_users").select("id").eq("candidate_id", candidate.id).maybeSingle();
    if (existingLink) {
      return new Response(JSON.stringify({ error: "This candidate already has a login." }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let targetUserId: string;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: fullName || candidate.candidate_name, candidate_emp_id: candidate.emp_id },
    });

    if (createErr) {
      const msg = (createErr.message || "").toLowerCase();
      const isExisting = msg.includes("already");
      if (!isExisting) {
        return new Response(JSON.stringify({ error: createErr.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = list?.users?.find(u => u.email === email);
      if (!existing) {
        return new Response(JSON.stringify({ error: "User exists but could not be found." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      targetUserId = existing.id;
    } else if (!created?.user) {
      return new Response(JSON.stringify({ error: "Could not create user" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      targetUserId = created.user.id;
    }

    const { error: linkErr } = await admin.from("candidate_users").insert({
      user_id: targetUserId,
      candidate_id: candidate.id,
      emp_id: candidate.emp_id,
    });
    if (linkErr) {
      if (!createErr) await admin.auth.admin.deleteUser(targetUserId);
      return new Response(JSON.stringify({ error: `Failed to link: ${linkErr.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("profiles").upsert({
      id: targetUserId, email, full_name: fullName || candidate.candidate_name,
    }, { onConflict: "id" });

    return new Response(
      JSON.stringify({ success: true, userId: targetUserId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-candidate-user error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
