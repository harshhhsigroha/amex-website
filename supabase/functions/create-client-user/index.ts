import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify authorization header exists
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode JWT to get user ID (without verifying signature - we trust Supabase's API gateway)
    const token = authHeader.replace("Bearer ", "");
    let userId: string;
    
    try {
      const [_header, payload, _signature] = decode(token);
      const claims = payload as { sub?: string; exp?: number };
      
      if (!claims.sub) {
        throw new Error("Missing sub claim");
      }
      
      // Check if token is expired
      if (claims.exp && claims.exp * 1000 < Date.now()) {
        return new Response(JSON.stringify({ error: "Token expired" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      userId = claims.sub;
    } catch (decodeError) {
      console.error("JWT decode error:", decodeError);
      return new Response(JSON.stringify({ error: "Invalid token format" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user exists using admin API
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      console.error("User verification error:", userError);
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller's role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    const isAdmin = roleData && ["super_admin", "admin"].includes(roleData.role);

    // Check if caller is a client (company staff)
    const { data: clientUserData } = await supabaseAdmin
      .from("client_users")
      .select("client_id")
      .eq("user_id", userId)
      .maybeSingle();

    const isClientUser = !!clientUserData;

    if (!isAdmin && !isClientUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    // userType: 'client' (company login - admin only) | 'portal' (end user login)
    const { email, password, fullName, clientId, userType = 'client', subClientId = null } = await req.json();

    if (!email || !password || !fullName || !clientId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!['client', 'portal'].includes(userType)) {
      return new Response(JSON.stringify({ error: "Invalid userType. Must be 'client' or 'portal'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Company staff can only create portal users for their own client
    if (isClientUser && !isAdmin) {
      if (userType !== 'portal') {
        return new Response(JSON.stringify({ error: "Company staff can only create end user (portal) accounts" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (clientUserData.client_id !== clientId) {
        return new Response(JSON.stringify({ error: "You can only create users for your own company" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Create the user using admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!newUser.user) {
      return new Response(JSON.stringify({ error: "User creation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Link user to the correct table based on userType
    const table = userType === 'portal' ? 'portal_users' : 'client_users';
    const insertPayload: Record<string, string | null> = { user_id: newUser.user.id, client_id: clientId };
    if (userType === 'portal' && subClientId) {
      insertPayload.sub_client_id = subClientId;
    }
    const { error: linkError } = await supabaseAdmin.from(table).insert(insertPayload);

    if (linkError) {
      console.error("Error linking user:", linkError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(JSON.stringify({ error: `Failed to link user: ${linkError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Successfully created ${userType} user:`, newUser.user.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUser.user.id,
        email: newUser.user.email 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
