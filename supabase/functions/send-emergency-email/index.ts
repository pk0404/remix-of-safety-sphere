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

    const { user_id, latitude, longitude, missed_count, user_name, last_check_in, selected_contact_ids }: EmergencyEmailRequest = await req.json();

    console.log(`[Emergency Email] Processing for user ${user_id}, missed: ${missed_count}`);

    // Fetch emergency contacts - optionally filter by selected IDs
    let query = supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", user_id);

    if (selected_contact_ids && selected_contact_ids.length > 0) {
      query = query.in("id", selected_contact_ids);
    }

    const { data: contacts, error: contactsError } = await query;

    if (contactsError) {
      console.error("[Emergency Email] Error fetching contacts:", contactsError);
      throw contactsError;
    }

    if (!contacts || contacts.length === 0) {
      console.log("[Emergency Email] No emergency contacts found");
      return new Response(
        JSON.stringify({ success: false, message: "No emergency contacts found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user_id)
      .single();

    const userName = user_name || profile?.full_name || "A SafeHer User";
    const userPhone = profile?.phone || "Not provided";

    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const currentTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    // Filter contacts with email
    const contactsWithEmail = contacts.filter((contact: { email?: string }) => contact.email);
    
    if (contactsWithEmail.length === 0) {
      // If no contacts have email, try sending to ALL contacts regardless of selection
      const { data: allContacts } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", user_id);

      const allWithEmail = (allContacts || []).filter((c: { email?: string }) => c.email);
      
      if (allWithEmail.length === 0) {
        console.log("[Emergency Email] No contacts have email addresses");
        return new Response(
          JSON.stringify({ success: false, message: "No contacts have email addresses configured" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Use all contacts with email as fallback
      contactsWithEmail.push(...allWithEmail);
    }

    const isPoliceLevel = missed_count >= 3;
    
    const emailPromises = contactsWithEmail
      .map(async (contact: { name: string; relationship?: string; phone: string; email: string }) => {
        console.log(`[Emergency Email] Sending alert to ${contact.name} at ${contact.email}`);

        try {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #fff; padding: 20px; border: 1px solid #e5e5e5; }
                .alert-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 10px; padding: 20px; margin: 20px 0; }
                .location-link { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 0; font-weight: bold; }
                .info-grid { display: grid; gap: 10px; margin: 20px 0; }
                .info-item { background: #f9fafb; padding: 10px; border-radius: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .critical { background: #7f1d1d; color: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${isPoliceLevel ? '🆘 CRITICAL EMERGENCY ALERT' : '⚠️ Emergency Safety Alert'}</h1>
                </div>
                <div class="content">
                  <div class="alert-box">
                    <h2 style="color: #dc2626; margin-top: 0;">🚨 ${userName} has missed ${missed_count} safety check-ins</h2>
                    <p>This is an automated emergency alert from SafeHer. ${userName} has not responded to multiple safety check-in reminders.</p>
                  </div>
                  
                  ${isPoliceLevel ? `
                  <div class="critical">
                    <h3 style="margin: 0;">⚡ POLICE HAVE BEEN ALERTED</h3>
                    <p style="margin: 5px 0 0;">Emergency services are being contacted with live location data.</p>
                  </div>
                  ` : ''}
                  
                  <h3>📍 Live Location</h3>
                  <p>Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
                  <a href="${mapsLink}" class="location-link" target="_blank">📍 View Live Location on Google Maps</a>
                  
                  <div class="info-grid">
                    <div class="info-item">
                      <strong>👤 User:</strong> ${userName}
                    </div>
                    <div class="info-item">
                      <strong>📞 Phone:</strong> ${userPhone}
                    </div>
                    <div class="info-item">
                      <strong>⏰ Alert Time:</strong> ${currentTime}
                    </div>
                    <div class="info-item">
                      <strong>❌ Missed Check-ins:</strong> ${missed_count}
                    </div>
                    ${last_check_in ? `
                    <div class="info-item">
                      <strong>✅ Last Check-in:</strong> ${new Date(last_check_in).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}
                    </div>
                    ` : ""}
                  </div>

                  <h3>🆘 Immediate Actions Required</h3>
                  <ol>
                    <li><strong>Call ${userName} immediately</strong> at ${userPhone}</li>
                    <li>Check their <a href="${mapsLink}">live location on Google Maps</a></li>
                    <li>If no response, contact local police: <strong>100</strong></li>
                    <li>Women Helpline: <strong>1091</strong> | Ambulance: <strong>102</strong></li>
                  </ol>

                  <p style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <strong>⚠️ This is an automated safety alert.</strong> ${userName} set up periodic safety check-ins 
                    and has missed ${missed_count} consecutive check-ins. Please take immediate action.
                  </p>
                </div>
                <div class="footer">
                  <p>SafeHer - Women Safety App | Automated Emergency Alert System</p>
                </div>
              </div>
            </body>
            </html>
          `;

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "SafeHer Emergency <onboarding@resend.dev>",
              to: [contact.email],
              subject: `${isPoliceLevel ? '🆘 CRITICAL' : '🚨 URGENT'}: ${userName} has missed ${missed_count} safety check-ins - IMMEDIATE ACTION REQUIRED`,
              html: emailHtml,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error(`[Emergency Email] Failed to send to ${contact.name}:`, data);
            return { contact: contact.name, email: contact.email, success: false, error: data.message || JSON.stringify(data) };
          }

          console.log(`[Emergency Email] Sent successfully to ${contact.name} (${contact.email})`, data);
          return { contact: contact.name, email: contact.email, success: true, id: data?.id };
        } catch (err) {
          console.error(`[Emergency Email] Error sending to ${contact.name}:`, err);
          return { contact: contact.name, email: contact.email, success: false, error: String(err) };
        }
      });

    const results = await Promise.all(emailPromises);

    await supabase.from("safety_analytics").insert({
      user_id,
      metric_type: "emergency_email_sent",
      metadata: { 
        missed_count, 
        contacts_notified: results.filter((r: { success: boolean }) => r.success).length,
        police_alerted: isPoliceLevel,
        results: results,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: `Emergency emails sent to ${results.filter((r: { success: boolean }) => r.success).length} contacts`,
        police_alerted: isPoliceLevel,
      }),
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
