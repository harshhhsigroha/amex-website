import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const trimmedName = candidateName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return new Response(JSON.stringify({ error: "Name must be between 2 and 100 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate client exists
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("id, company_name")
      .eq("id", clientId)
      .maybeSingle();

    if (!client) {
      return new Response(JSON.stringify({ error: "Invalid company link" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to find candidate; if not found, create a placeholder
    let candidate: { id: string; candidate_name: string; emp_id: string };

    const { data: candidates } = await supabaseAdmin
      .from("candidates")
      .select("id, candidate_name, emp_id")
      .ilike("candidate_name", trimmedName);

    if (candidates && candidates.length > 0) {
      candidate = candidates[0];
    } else {
      // Auto-create a candidate record for this person
      const empId = `CLK-${Date.now().toString(36).toUpperCase()}`;
      const { data: newCandidate, error: createErr } = await supabaseAdmin
        .from("candidates")
        .insert({
          candidate_name: trimmedName,
          emp_id: empId,
        })
        .select("id, candidate_name, emp_id")
        .single();

      if (createErr || !newCandidate) {
        console.error("Failed to create candidate:", createErr);
        return new Response(JSON.stringify({ error: "Failed to register. Please try again." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      candidate = newCandidate;
    }

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
    
    const april6 = new Date(fyStartYear, 3, 6);
    const dayOfWeek = april6.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const week1Monday = new Date(april6);
    week1Monday.setDate(april6.getDate() + mondayOffset);
    const daysSince = Math.floor((now.getTime() - week1Monday.getTime()) / (1000 * 60 * 60 * 24));
    const financialWeek = Math.floor(daysSince / 7) + 1;

    if (action === "lookup") {
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
