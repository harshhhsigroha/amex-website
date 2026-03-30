import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    // Validate auth header
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

    // Verify caller exists
    const { data: callerData, error: callerError } = await supabaseAdmin.auth.admin.getUserById(callerId);
    if (callerError || !callerData?.user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CRITICAL: Only super_admin can create admin users
    const { data: roleData } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", callerId).maybeSingle();
    
    if (!roleData || roleData.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Only Super Admins can create admin users" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and validate input
    const { email, password, fullName, role } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate password strength
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return new Response(JSON.stringify({ error: "Password must contain uppercase, lowercase, and a number" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Full name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!role || !['admin', 'super_admin'].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role. Must be 'admin' or 'super_admin'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles").select("id").eq("email", email.toLowerCase()).maybeSingle();

    if (existingProfile) {
      // User exists — check if they already have a role
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles").select("id").eq("user_id", existingProfile.id).maybeSingle();
      
      if (existingRole) {
        return new Response(JSON.stringify({ error: "This user already has an admin role" }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // User exists but no role — add role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles").insert({ user_id: existingProfile.id, role });

      if (roleError) {
        return new Response(JSON.stringify({ error: "Failed to assign role" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ success: true, userId: existingProfile.id, email, existingUser: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName.trim() },
    });

    if (createError || !newUser.user) {
      console.error("Error creating user:", createError);
      return new Response(JSON.stringify({ error: createError?.message || "Failed to create user" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = newUser.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: newUserId,
      email: email.toLowerCase(),
      full_name: fullName.trim(),
    }, { onConflict: "id" });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Cleanup: delete the created user
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: "Failed to create profile" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles").insert({ user_id: newUserId, role });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      // Cleanup
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: "Failed to assign role" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create default permissions for admin (not super_admin)
    if (role === 'admin') {
      await supabaseAdmin.from("admin_permissions").insert({
        user_id: newUserId,
        can_manage_clients: false,
        can_manage_candidates: false,
        can_generate_invoices: false,
        can_generate_self_bills: false,
        can_view_history: false,
        can_view_dashboard: true,
      });
    }

    console.log(`Successfully created admin user: ${email} with role: ${role}`);

    return new Response(
      JSON.stringify({ success: true, userId: newUserId, email: email.toLowerCase(), existingUser: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
