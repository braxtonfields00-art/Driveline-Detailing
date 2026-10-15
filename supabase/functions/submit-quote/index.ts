import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

function clean(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    // Honeypot field: silently accept bots without saving or notifying.
    if (clean(body.website, 200)) return json({ success: true });

    const lead = {
      name: clean(body.name, 120),
      phone: clean(body.phone, 50),
      email: clean(body.email, 254) || null,
      vehicle: clean(body.vehicle, 160),
      service: clean(body.service, 100),
      location: clean(body.location, 160),
      condition: clean(body.condition, 100) || null,
      notes: clean(body.notes, 3000) || null,
      source: clean(body.source, 500) || null,
    };

    if (!lead.name || !lead.phone || !lead.vehicle || !lead.service || !lead.location) {
      return json({ success: false, error: "Please complete all required fields." }, 400);
    }
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      return json({ success: false, error: "Please enter a valid email address." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) throw new Error("Server database configuration is missing.");

    const db = createClient(supabaseUrl, serviceKey);
    const { data: saved, error: dbError } = await db.from("quote_requests").insert(lead).select("id,created_at").single();
    if (dbError) throw dbError; // Do not report success unless the lead is saved.

    const details = [
      "New Driveline Detailing quote request",
      `Name: ${lead.name}`, `Phone: ${lead.phone}`, `Email: ${lead.email || "Not provided"}`,
      `Vehicle: ${lead.vehicle}`, `Service: ${lead.service}`, `Location: ${lead.location}`,
      `Condition: ${lead.condition || "Not specified"}`, `Notes: ${lead.notes || "None"}`,
      `Lead ID: ${saved.id}`, `Received: ${saved.created_at}`,
    ].join("\n");

    const tasks: Promise<unknown>[] = [];
    const ownerPhone = Deno.env.get("OWNER_PHONE");
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFrom = Deno.env.get("TWILIO_FROM_NUMBER");

    if (ownerPhone && twilioSid && twilioToken && twilioFrom) {
      const auth = btoa(`${twilioSid}:${twilioToken}`);
      const params = new URLSearchParams({ To: ownerPhone, From: twilioFrom, Body: details.slice(0, 1500) });
      tasks.push(fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params,
      }).then(async r => { if (!r.ok) console.error("Owner SMS failed", await r.text()); }));
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const ownerEmail = Deno.env.get("OWNER_EMAIL");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    if (resendKey && ownerEmail && fromEmail) {
      tasks.push(fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromEmail, to: [ownerEmail], subject: `New quote request — ${lead.name} / ${lead.vehicle}`, text: details }),
      }).then(async r => { if (!r.ok) console.error("Owner email failed", await r.text()); }));
    }

    // Optional customer confirmation email. The request is already saved even if a notification provider fails.
    if (resendKey && fromEmail && lead.email) {
      tasks.push(fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail, to: [lead.email], subject: "We received your Driveline Detailing quote request",
          text: `Hi ${lead.name},\n\nThanks for contacting Driveline Detailing. We received your request for ${lead.vehicle} (${lead.service}). This is not a confirmed appointment; we'll review the details and follow up with you directly.\n\nDriveline Detailing\nFlemingsburg, Kentucky`,
        }),
      }).then(async r => { if (!r.ok) console.error("Customer confirmation email failed", await r.text()); }));
    }

    // Notifications are best-effort; database save is the source of truth.
    await Promise.allSettled(tasks);
    return json({ success: true, requestId: saved.id });
  } catch (err) {
    console.error("Quote submission failed", err);
    return json({ success: false, error: "We couldn't save your request. Please try again or contact us directly." }, 500);
  }
});
