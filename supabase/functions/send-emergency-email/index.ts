import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmergencyEmailRequest {
  user_id: string;
  latitude: number;
  longitude: number;
  missed_count: number;
  user_name?: string;
  last_check_in?: string;
  selected_contact_ids?: string[];
  journey_notification?: boolean;
  journey_type?: 'started' | 'arrived' | 'missed_checkin';
  journey_destination?: string;
  transport_mode?: string;
  estimated_arrival?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: EmergencyEmailRequest = await req.json();
    const { user_id, latitude, longitude, missed_count, user_name, last_check_in, selected_contact_ids, journey_notification, journey_type, journey_destination, transport_mode, estimated_arrival } = body;

    console.log(`[Emergency Email] Processing for user ${user_id}, type: ${journey_notification ? 'journey_' + journey_type : 'check_in'}, missed: ${missed_count}`);

    // Fetch emergency contacts
    let query = supabase.from("emergency_contacts").select("*").eq("user_id", user_id);
    if (selected_contact_ids && selected_contact_ids.length > 0) {
      query = query.in("id", selected_contact_ids);
    }

    const { data: contacts, error: contactsError } = await query;
    if (contactsError) throw contactsError;

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No emergency contacts found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile
    const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", user_id).single();
    const userName = user_name || profile?.full_name || "A SafeHer User";
    const userPhone = profile?.phone || "Not provided";

    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" });

    // Filter contacts with email
    let contactsWithEmail = contacts.filter((c: any) => c.email);
    
    if (contactsWithEmail.length === 0) {
      const { data: allContacts } = await supabase.from("emergency_contacts").select("*").eq("user_id", user_id);
      contactsWithEmail = (allContacts || []).filter((c: any) => c.email);
      
      if (contactsWithEmail.length === 0) {
        return new Response(
          JSON.stringify({ success: false, message: "No contacts have email addresses" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const isPoliceLevel = missed_count >= 3;

    const buildEmailHtml = (contact: any) => {
      if (journey_notification && journey_type) {
        return buildJourneyEmailHtml(contact, journey_type);
      }
      return buildCheckInEmailHtml(contact);
    };

    const buildSubject = (contact: any) => {
      if (journey_notification) {
        if (journey_type === 'started') return `📍 ${userName} started a journey to ${journey_destination || 'their destination'}`;
        if (journey_type === 'arrived') return `✅ ${userName} arrived safely at ${journey_destination || 'their destination'}`;
        if (journey_type === 'missed_checkin') return `🚨 URGENT: ${userName} missed check-in during journey`;
      }
      return `${isPoliceLevel ? '🆘 CRITICAL' : '🚨 URGENT'}: ${userName} missed ${missed_count} safety check-ins - ACTION REQUIRED`;
    };

    const buildJourneyEmailHtml = (contact: any, type: string) => {
      const etaStr = estimated_arrival ? new Date(estimated_arrival).toLocaleString("en-US", { timeZone: "Asia/Kolkata", timeStyle: "short" }) : "Not set";
      
      if (type === 'started') {
        return `<!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center}
          .content{background:#fff;padding:20px;border:1px solid #e5e5e5}
          .location-link{display:inline-block;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:10px 0;font-weight:bold}
          .info-item{background:#f9fafb;padding:10px;border-radius:5px;margin:5px 0}
          .footer{text-align:center;padding:20px;color:#666;font-size:12px}
        </style></head><body><div class="container">
          <div class="header"><h1>📍 Journey Started</h1></div>
          <div class="content">
            <h2 style="color:#3b82f6">${userName} has started a journey</h2>
            <p>Hi ${contact.name}, ${userName} wants you to know they have started a trip. You can track their location using the link below.</p>
            <div class="info-item"><strong>🎯 Destination:</strong> ${journey_destination || 'Not specified'}</div>
            <div class="info-item"><strong>🚗 Transport:</strong> ${transport_mode || 'Not specified'}</div>
            <div class="info-item"><strong>⏰ Estimated Arrival:</strong> ${etaStr}</div>
            <div class="info-item"><strong>📞 Phone:</strong> ${userPhone}</div>
            <div class="info-item"><strong>🕐 Started:</strong> ${currentTime}</div>
            <h3>📍 Track Live Location</h3>
            <p>Click the button below to see their current location on Google Maps:</p>
            <a href="${mapsLink}" class="location-link" target="_blank">📍 View Location on Google Maps</a>
            <p style="background:#dbeafe;padding:15px;border-radius:8px;margin-top:20px">
              <strong>ℹ️</strong> You will receive another email when ${userName} arrives safely or if they miss a check-in during the journey.
            </p>
          </div>
          <div class="footer"><p>SafeHer - Women Safety App</p></div>
        </div></body></html>`;
      }

      if (type === 'arrived') {
        return `<!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background:linear-gradient(135deg,#22c55e,#16a34a);color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center}
          .content{background:#fff;padding:20px;border:1px solid #e5e5e5}
          .footer{text-align:center;padding:20px;color:#666;font-size:12px}
        </style></head><body><div class="container">
          <div class="header"><h1>✅ Arrived Safely</h1></div>
          <div class="content">
            <h2 style="color:#22c55e">${userName} has arrived safely!</h2>
            <p>Hi ${contact.name}, good news - ${userName} has arrived at ${journey_destination || 'their destination'} safely.</p>
            <p><strong>Arrival Time:</strong> ${currentTime}</p>
          </div>
          <div class="footer"><p>SafeHer - Women Safety App</p></div>
        </div></body></html>`;
      }

      // missed_checkin during journey
      return buildCheckInEmailHtml(contact);
    };

    const buildCheckInEmailHtml = (contact: any) => {
      return `<!DOCTYPE html><html><head><style>
        body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
        .container{max-width:600px;margin:0 auto;padding:20px}
        .header{background:linear-gradient(135deg,#dc2626,#991b1b);color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center}
        .content{background:#fff;padding:20px;border:1px solid #e5e5e5}
        .alert-box{background:#fef2f2;border:2px solid #dc2626;border-radius:10px;padding:20px;margin:20px 0}
        .location-link{display:inline-block;background:#dc2626;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:10px 0;font-weight:bold}
        .info-item{background:#f9fafb;padding:10px;border-radius:5px;margin:5px 0}
        .critical{background:#7f1d1d;color:#fef2f2;padding:15px;border-radius:8px;margin:15px 0;text-align:center}
        .footer{text-align:center;padding:20px;color:#666;font-size:12px}
      </style></head><body><div class="container">
        <div class="header"><h1>${isPoliceLevel ? '🆘 CRITICAL EMERGENCY' : '⚠️ Safety Alert'}</h1></div>
        <div class="content">
          <div class="alert-box">
            <h2 style="color:#dc2626;margin-top:0">🚨 ${userName} missed ${missed_count} safety check-ins</h2>
            <p>This is an automated emergency alert. ${userName} has not responded to safety check-in reminders.</p>
          </div>
          ${isPoliceLevel ? '<div class="critical"><h3 style="margin:0">⚡ POLICE ALERT TRIGGERED</h3><p style="margin:5px 0 0">Emergency services (100) are being contacted.</p></div>' : ''}
          <h3>📍 Live Location</h3>
          <p>Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
          <a href="${mapsLink}" class="location-link" target="_blank">📍 View Location on Google Maps</a>
          <div class="info-item"><strong>👤 User:</strong> ${userName}</div>
          <div class="info-item"><strong>📞 Phone:</strong> ${userPhone}</div>
          <div class="info-item"><strong>⏰ Alert Time:</strong> ${currentTime}</div>
          <div class="info-item"><strong>❌ Missed Check-ins:</strong> ${missed_count}</div>
          ${last_check_in ? `<div class="info-item"><strong>✅ Last Check-in:</strong> ${new Date(last_check_in).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}</div>` : ''}
          ${journey_destination ? `<div class="info-item"><strong>🎯 Journey to:</strong> ${journey_destination}</div>` : ''}
          <h3>🆘 Actions Required</h3>
          <ol>
            <li><strong>Call ${userName}</strong> at ${userPhone}</li>
            <li>Check their <a href="${mapsLink}">live location</a></li>
            <li>If no response, call police: <strong>100</strong></li>
            <li>Women Helpline: <strong>1091</strong> | Ambulance: <strong>102</strong></li>
          </ol>
        </div>
        <div class="footer"><p>SafeHer - Automated Emergency Alert</p></div>
      </div></body></html>`;
    };

    const emailPromises = contactsWithEmail.map(async (contact: any) => {
      console.log(`[Emergency Email] Sending to ${contact.name} at ${contact.email}`);
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "SafeHer Emergency <onboarding@resend.dev>",
            to: [contact.email],
            subject: buildSubject(contact),
            html: buildEmailHtml(contact),
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error(`[Emergency Email] Failed for ${contact.name}:`, data);
          return { contact: contact.name, email: contact.email, success: false, error: data.message || JSON.stringify(data) };
        }
        console.log(`[Emergency Email] Sent to ${contact.name}`, data);
        return { contact: contact.name, email: contact.email, success: true, id: data?.id };
      } catch (err) {
        console.error(`[Emergency Email] Error for ${contact.name}:`, err);
        return { contact: contact.name, email: contact.email, success: false, error: String(err) };
      }
    });

    const results = await Promise.all(emailPromises);

    await supabase.from("safety_analytics").insert({
      user_id,
      metric_type: journey_notification ? "journey_email_sent" : "emergency_email_sent",
      metadata: { missed_count, contacts_notified: results.filter((r: any) => r.success).length, results },
    });

    return new Response(
      JSON.stringify({ success: true, results, message: `Emails sent to ${results.filter((r: any) => r.success).length} contacts` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[Emergency Email] Error:", error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
