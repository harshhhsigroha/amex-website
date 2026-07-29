import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit, getRateLimitedResponse } from "../_shared/rate-limit.ts";
import { sanitizeString, isValidUUID, validatePassword } from "../_shared/sanitize.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit: 10 per 15 min per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit("update-client-password", ip, 10, 15 * 60 * 1000);
    if (rl.limited) return getRateLimitedResponse(corsHeaders);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    let callerId: string;
    {
      const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (authError || !authData?.user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      callerId = authData.user.id;
    }

    // Validate caller
    const { data: roleData } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", callerId).maybeSingle();
    const isAdmin = roleData && ["super_admin", "admin"].includes(roleData.role);

    const { data: clientUserData } = await supabaseAdmin
      .from("client_users").select("client_id").eq("user_id", callerId).maybeSingle();
    const isClientUser = !!clientUserData;

    if (!isAdmin && !isClientUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetUserId = String(body.userId || "");
    const action = String(body.action || "password");

    if (!isValidUUID(targetUserId)) {
      return new Response(JSON.stringify({ error: "Invalid userId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If client user, verify target user belongs to their client
    if (isClientUser && !isAdmin) {
      const { data: targetPortalUser } = await supabaseAdmin
        .from("portal_users").select("client_id").eq("user_id", targetUserId).maybeSingle();
      const { data: targetClientUser } = await supabaseAdmin
        .from("client_users").select("client_id").eq("user_id", targetUserId).maybeSingle();

      const targetClientId = targetPortalUser?.client_id || targetClientUser?.client_id;
      if (!targetClientId || targetClientId !== clientUserData.client_id) {
        return new Response(JSON.stringify({ error: "Unauthorized: can only manage your own users" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "update_info") {
      const fullName = sanitizeString(body.fullName, 200);
      if (fullName && fullName.length >= 2) {
        const { error: profileError } = await supabaseAdmin
          .from("profiles").update({ full_name: fullName }).eq("id", targetUserId);
        if (profileError) throw profileError;

        await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          user_metadata: { full_name: fullName }
        });
      }
      return new Response(JSON.stringify({ success: true, message: "User info updated" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: password update
    const passwordCheck = validatePassword(body.newPassword);
    if (!passwordCheck.valid) {
      return new Response(JSON.stringify({ error: passwordCheck.error }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      password: body.newPassword as string
    });

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Password updated successfully" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
