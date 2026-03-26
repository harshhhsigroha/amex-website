import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { name, email, company, contractors, message } = await req.json();

    if (!name || !email || !company) {
      return new Response(
        JSON.stringify({ error: "Name, email, and company are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
          New Demo Request – PayCore
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px; font-weight: bold; width: 40%;">Name</td>
            <td style="padding: 10px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Email</td>
            <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px; font-weight: bold;">Company</td>
            <td style="padding: 10px;">${company}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Contractors / Week</td>
            <td style="padding: 10px;">${contractors || "Not specified"}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px; font-weight: bold; vertical-align: top;">Message</td>
            <td style="padding: 10px;">${message || "No message provided"}</td>
          </tr>
        </table>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          Sent from AMEX Outsourcing contact form.
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PayCore <noreply@firmflow.app>",
        to: ["harsh@firmflow.app"],
        reply_to: email,
        subject: `Demo Request – ${company}`,
        html: htmlBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: data }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
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
