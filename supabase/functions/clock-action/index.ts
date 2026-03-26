import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { action, clientId, candidateName, lat, lng, address } = await req.json();

    if (!action || !clientId || !candidateName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Lookup candidate by name for this client (candidates are global, but we validate client exists)
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("id, company_name")
      .eq("id", clientId)
      .maybeSingle();

    if (!client) {
      return new Response(JSON.stringify({ error: "Invalid company" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find candidate by name (case-insensitive)
    const { data: candidates } = await supabaseAdmin
      .from("candidates")
      .select("*")
      .ilike("candidate_name", candidateName.trim());

    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ error: "Employee not found. Please check your name and try again." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const candidate = candidates[0];

    // Calculate UK financial week/year
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    let fyStartYear: number;
    if (month < 3 || (month === 3 && day < 6)) {
      fyStartYear = year - 1;
    } else {
      fyStartYear = year;
    }
    const fyEndYear = fyStartYear + 1;
    const financialYear = `FY ${fyStartYear}–${String(fyEndYear).slice(-2)}`;
    
    // Calculate week number
    const april6 = new Date(fyStartYear, 3, 6);
    const dayOfWeek = april6.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const week1Monday = new Date(april6);
    week1Monday.setDate(april6.getDate() + mondayOffset);
    const daysSince = Math.floor((now.getTime() - week1Monday.getTime()) / (1000 * 60 * 60 * 24));
    const financialWeek = Math.floor(daysSince / 7) + 1;

    if (action === "lookup") {
      // Check if candidate has an active (open) clock-in
      const { data: activeLog } = await supabaseAdmin
        .from("time_logs")
        .select("*")
        .eq("candidate_id", candidate.id)
        .eq("client_id", clientId)
        .is("clock_out", null)
        .order("clock_in", { ascending: false })
        .limit(1)
        .maybeSingle();

      return new Response(JSON.stringify({
        found: true,
        candidate: {
          id: candidate.id,
          name: candidate.candidate_name,
          emp_id: candidate.emp_id,
        },
        activeSession: activeLog ? {
          id: activeLog.id,
          clockIn: activeLog.clock_in,
          clockInAddress: activeLog.clock_in_address,
        } : null,
        companyName: client.company_name,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "clock_in") {
      // Check for existing active session
      const { data: activeLog } = await supabaseAdmin
        .from("time_logs")
        .select("id")
        .eq("candidate_id", candidate.id)
        .eq("client_id", clientId)
        .is("clock_out", null)
        .maybeSingle();

      if (activeLog) {
        return new Response(JSON.stringify({ error: "You already have an active clock-in session. Please clock out first." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const today = now.toISOString().split("T")[0];

      const { data: newLog, error: insertError } = await supabaseAdmin
        .from("time_logs")
        .insert({
          candidate_id: candidate.id,
          client_id: clientId,
          candidate_name: candidate.candidate_name,
          emp_id: candidate.emp_id,
          clock_in: now.toISOString(),
          clock_in_lat: lat || null,
          clock_in_lng: lng || null,
          clock_in_address: address || null,
          log_date: today,
          financial_week: financialWeek,
          financial_year: financialYear,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Clock-in error:", insertError);
        return new Response(JSON.stringify({ error: "Failed to clock in" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        action: "clock_in",
        logId: newLog.id,
        clockIn: newLog.clock_in,
        address: newLog.clock_in_address,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "clock_out") {
      // Find active session
      const { data: activeLog } = await supabaseAdmin
        .from("time_logs")
        .select("*")
        .eq("candidate_id", candidate.id)
        .eq("client_id", clientId)
        .is("clock_out", null)
        .order("clock_in", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!activeLog) {
        return new Response(JSON.stringify({ error: "No active clock-in session found." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Calculate hours
      const clockInTime = new Date(activeLog.clock_in).getTime();
      const clockOutTime = now.getTime();
      const totalHours = Math.round(((clockOutTime - clockInTime) / (1000 * 60 * 60)) * 100) / 100;

      const { error: updateError } = await supabaseAdmin
        .from("time_logs")
        .update({
          clock_out: now.toISOString(),
          clock_out_lat: lat || null,
          clock_out_lng: lng || null,
          clock_out_address: address || null,
          total_hours: totalHours,
        })
        .eq("id", activeLog.id);

      if (updateError) {
        console.error("Clock-out error:", updateError);
        return new Response(JSON.stringify({ error: "Failed to clock out" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        action: "clock_out",
        logId: activeLog.id,
        clockIn: activeLog.clock_in,
        clockOut: now.toISOString(),
        totalHours,
        address,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
