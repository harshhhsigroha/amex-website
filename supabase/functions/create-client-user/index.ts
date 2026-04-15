import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { rateLimit, getRateLimitedResponse } from "../_shared/rate-limit.ts";
import { sanitizeString, sanitizeEmail, isValidUUID } from "../_shared/sanitize.ts";

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
    const rl = rateLimit("create-client-user", ip, 10, 15 * 60 * 1000);
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
    let userId: string;

    try {
      const [_header, payload, _signature] = decode(token);
      const claims = payload as { sub?: string; exp?: number };
      if (!claims.sub) throw new Error("Missing sub claim");
      if (claims.exp && claims.exp * 1000 < Date.now()) {
        return new Response(JSON.stringify({ error: "Token expired" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = claims.sub;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid token format" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller's role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", userId).maybeSingle();
    const isAdmin = roleData && ["super_admin", "admin"].includes(roleData.role);

    const { data: clientUserData } = await supabaseAdmin
      .from("client_users").select("client_id").eq("user_id", userId).maybeSingle();
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

    const email = sanitizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = sanitizeString(body.fullName, 200);
    const clientId = String(body.clientId || "");
    const userType = String(body.userType || "client");
    const subClientId = body.subClientId ? String(body.subClientId) : null;

    if (!email) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!password || password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!fullName || fullName.length < 2) {
      return new Response(JSON.stringify({ error: "Full name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidUUID(clientId)) {
      return new Response(JSON.stringify({ error: "Invalid client ID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!['client', 'portal'].includes(userType)) {
      return new Response(JSON.stringify({ error: "Invalid userType" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (subClientId && !isValidUUID(subClientId)) {
      return new Response(JSON.stringify({ error: "Invalid sub-client ID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Company staff can only create portal users for their own client
    if (isClientUser && !isAdmin) {
      if (userType !== 'portal') {
        return new Response(JSON.stringify({ error: "Company staff can only create end user (portal) accounts" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (clientUserData.client_id !== clientId) {
        return new Response(JSON.stringify({ error: "You can only create users for your own company" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Try to create the user
    let targetUserId: string;
    let targetEmail: string;

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      const errMsg = createError.message || "";
      const errCode = (createError as any).code || "";
      const isExisting = errMsg.includes("already") || errCode === "email_exists" || (createError as any).status === 422;

      if (isExisting) {
        const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existingUser = allUsers?.users?.find(u => u.email === email);

        if (!existingUser) {
          return new Response(JSON.stringify({ error: "User exists but could not be found. Try a different email." }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const table = userType === 'portal' ? 'portal_users' : 'client_users';
        const { data: existingLink } = await supabaseAdmin
          .from(table).select("id").eq("user_id", existingUser.id).eq("client_id", clientId).maybeSingle();

        if (existingLink) {
          return new Response(JSON.stringify({ error: "This user is already linked to this client" }), {
            status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        targetUserId = existingUser.id;
        targetEmail = existingUser.email || email;
      } else {
        console.error("Error creating user:", createError);
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (!newUser.user) {
      return new Response(JSON.stringify({ error: "User creation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      targetUserId = newUser.user.id;
      targetEmail = newUser.user.email || email;
    }

    // Link user to the correct table
    const table = userType === 'portal' ? 'portal_users' : 'client_users';
    const insertPayload: Record<string, string | null> = { user_id: targetUserId, client_id: clientId };
    if (userType === 'portal' && subClientId) {
      insertPayload.sub_client_id = subClientId;
    }
    const { error: linkError } = await supabaseAdmin.from(table).insert(insertPayload);

    if (linkError) {
      console.error("Error linking user:", linkError);
      if (!createError) {
        await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      }
      return new Response(JSON.stringify({ error: `Failed to link user: ${linkError.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin.from("profiles").upsert({
      id: targetUserId,
      email: targetEmail,
      full_name: fullName,
    }, { onConflict: "id" });

    console.log(`Successfully created/linked ${userType} user:`, targetEmail);

    return new Response(
      JSON.stringify({ success: true, userId: targetUserId, email: targetEmail }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
