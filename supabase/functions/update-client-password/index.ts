import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    try {
      const [_header, payload, _signature] = decode(token);
      const claims = payload as { sub?: string; exp?: number };
      if (!claims.sub) throw new Error("Missing sub claim");
      if (claims.exp && claims.exp * 1000 < Date.now()) {
        return new Response(JSON.stringify({ error: "Token expired" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      callerId = claims.sub;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid token format" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Allow both super_admin and admin roles (and client users for their own portal users)
    const { data: roleData } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", callerId).maybeSingle();

    const isAdmin = roleData && ["super_admin", "admin"].includes(roleData.role);

    // Also check if caller is a client user (ops portal)
    const { data: clientUserData } = await supabaseAdmin
      .from("client_users").select("client_id").eq("user_id", callerId).maybeSingle();

    const isClientUser = !!clientUserData;

    if (!isAdmin && !isClientUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { userId, newPassword, fullName, action = "password" } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If client user, verify target user belongs to their client
    if (isClientUser && !isAdmin) {
      const { data: targetPortalUser } = await supabaseAdmin
        .from("portal_users").select("client_id").eq("user_id", userId).maybeSingle();
      const { data: targetClientUser } = await supabaseAdmin
        .from("client_users").select("client_id").eq("user_id", userId).maybeSingle();

      const targetClientId = targetPortalUser?.client_id || targetClientUser?.client_id;
      if (!targetClientId || targetClientId !== clientUserData.client_id) {
        return new Response(JSON.stringify({ error: "Unauthorized: can only manage your own users" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "update_info") {
      // Update profile name
      if (fullName) {
        const { error: profileError } = await supabaseAdmin
          .from("profiles").update({ full_name: fullName }).eq("id", userId);
        if (profileError) throw profileError;

        // Also update auth metadata
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { full_name: fullName }
        });
      }
      return new Response(JSON.stringify({ success: true, message: "User info updated" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: password update
    if (!newPassword) {
      return new Response(JSON.stringify({ error: "Missing newPassword" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
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
