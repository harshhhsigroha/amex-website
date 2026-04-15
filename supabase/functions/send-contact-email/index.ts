import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { rateLimit, getRateLimitedResponse } from "../_shared/rate-limit.ts";
import { sanitizeString, sanitizeEmail, escapeHtml } from "../_shared/sanitize.ts";

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
    // Rate limit: 5 requests per 15 minutes per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit("contact-email", ip, 5, 15 * 60 * 1000);
    if (rl.limited) return getRateLimitedResponse(corsHeaders);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const body = await req.json();

    // Validate & sanitize inputs
    const name = sanitizeString(body.name, 100);
    const email = sanitizeEmail(body.email);
    const company = sanitizeString(body.company, 200);
    const contractors = sanitizeString(body.contractors, 50);
    const message = sanitizeString(body.message, 2000);

    if (!name || name.length < 2) {
      return new Response(
        JSON.stringify({ error: "Name is required (at least 2 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: "A valid email address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!company || company.length < 2) {
      return new Response(
        JSON.stringify({ error: "Company name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Honeypot check
    if (body._hp_field) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Escape for HTML email template to prevent XSS in email clients
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company);
    const safeContractors = escapeHtml(contractors || "Not specified");
    const safeMessage = escapeHtml(message || "No message provided");

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
          New Demo Request – AMEX Outsourcing
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px; font-weight: bold; width: 40%;">Name</td>
            <td style="padding: 10px;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Email</td>
            <td style="padding: 10px;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px; font-weight: bold;">Company</td>
            <td style="padding: 10px;">${safeCompany}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Contractors / Week</td>
            <td style="padding: 10px;">${safeContractors}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px; font-weight: bold; vertical-align: top;">Message</td>
            <td style="padding: 10px;">${safeMessage}</td>
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
        from: "AMEX Outsourcing <noreply@amexoutsourcing.com>",
        to: ["accounts@amexoutsourcing.com"],
        reply_to: email,
        subject: `Demo Request – ${safeCompany}`,
        html: htmlBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
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
