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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
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

    const { user_id, latitude, longitude, missed_count, user_name, last_check_in }: EmergencyEmailRequest = await req.json();

    console.log(`[Emergency Email] Processing for user ${user_id}, missed: ${missed_count}`);

    // Fetch emergency contacts for the user
    const { data: contacts, error: contactsError } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", user_id);

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

    // Fetch user profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user_id)
      .single();

    const userName = user_name || profile?.full_name || "A SafeHer User";
    const userPhone = profile?.phone || "Not provided";

    // Google Maps link for location
    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const currentTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    // Send email to each contact using Resend HTTP API
    // Only send to contacts with email addresses
    const contactsWithEmail = contacts.filter((contact: { email?: string; name?: string }) => contact.email);
    
    if (contactsWithEmail.length === 0) {
      console.log("[Emergency Email] No contacts have email addresses configured");
      return new Response(
        JSON.stringify({ success: false, message: "No contacts have email addresses configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
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
                .location-link { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 0; }
                .info-grid { display: grid; gap: 10px; margin: 20px 0; }
                .info-item { background: #f9fafb; padding: 10px; border-radius: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>⚠️ Emergency Safety Alert</h1>
                </div>
                <div class="content">
                  <div class="alert-box">
                    <h2 style="color: #dc2626; margin-top: 0;">🚨 ${userName} has missed ${missed_count} safety check-ins</h2>
                    <p>This is an automated emergency alert from SafeHer. ${userName} has not responded to multiple safety check-in reminders.</p>
                  </div>
                  
                  <h3>📍 Last Known Location</h3>
                  <p>Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
                  <a href="${mapsLink}" class="location-link" target="_blank">View Location on Google Maps</a>
                  
                  <div class="info-grid">
                    <div class="info-item">
                      <strong>Contact Name:</strong> ${contact.name}
                    </div>
                    <div class="info-item">
                      <strong>Relationship:</strong> ${contact.relationship || "Not specified"}
                    </div>
                    <div class="info-item">
                      <strong>Alert Time:</strong> ${currentTime}
                    </div>
                    <div class="info-item">
                      <strong>Missed Check-ins:</strong> ${missed_count}
                    </div>
                    ${last_check_in ? `
                    <div class="info-item">
                      <strong>Last Check-in:</strong> ${new Date(last_check_in).toLocaleString()}
                    </div>
                    ` : ""}
                  </div>

                  <h3>🆘 Recommended Actions</h3>
                  <ol>
                    <li>Try to contact ${userName} immediately</li>
                    <li>If no response, check their location on the map</li>
                    <li>Consider contacting local emergency services if concerned</li>
                  </ol>

                  <p style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <strong>User's Phone:</strong> ${userPhone}<br>
                    <strong>Emergency Services:</strong> 100 (Police) | 102 (Ambulance) | 1091 (Women Helpline)
                  </p>
                </div>
                <div class="footer">
                  <p>This is an automated message from SafeHer - Women Safety App</p>
                  <p>If you believe this was sent in error, the user may have resolved their check-in.</p>
                </div>
              </div>
            </body>
            </html>
          `;

          // Using Resend HTTP API - send to actual contact email
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "SafeHer Emergency <onboarding@resend.dev>",
              to: [contact.email], // Send to actual contact email
              subject: `🚨 URGENT: ${userName} has missed ${missed_count} safety check-ins`,
              html: emailHtml,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error(`[Emergency Email] Failed to send to ${contact.name}:`, data);
            return { contact: contact.name, success: false, error: data.message };
          }

          console.log(`[Emergency Email] Sent successfully to ${contact.name}`, data);
          return { contact: contact.name, success: true, id: data?.id };
        } catch (err) {
          console.error(`[Emergency Email] Error sending to ${contact.name}:`, err);
          return { contact: contact.name, success: false, error: String(err) };
        }
      });

    const results = await Promise.all(emailPromises);

    // Log analytics
    await supabase.from("safety_analytics").insert({
      user_id,
      metric_type: "emergency_email_sent",
      metadata: { missed_count, contacts_notified: results.filter((r: { success: boolean }) => r.success).length },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: `Emergency emails sent to ${results.filter((r: { success: boolean }) => r.success).length} contacts` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[Emergency Email] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
