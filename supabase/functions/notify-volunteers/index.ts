import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { support_request_id } = await req.json();

    if (!support_request_id) {
      return new Response(
        JSON.stringify({ error: 'support_request_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the support request
    const { data: supportRequest, error: requestError } = await supabaseAdmin
      .from('support_requests')
      .select('*')
      .eq('id', support_request_id)
      .single();

    if (requestError || !supportRequest) {
      console.error('Error fetching support request:', requestError);
      return new Response(
        JSON.stringify({ error: 'Support request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing support request:', supportRequest.id);

    // Fetch all available volunteers
    const { data: volunteers, error: volunteersError } = await supabaseAdmin
      .from('volunteers')
      .select('*')
      .eq('is_available', true)
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null);

    if (volunteersError) {
      console.error('Error fetching volunteers:', volunteersError);
      throw volunteersError;
    }

    console.log(`Found ${volunteers?.length || 0} available volunteers`);

    // Find volunteers within range and create alerts
    const alertsToCreate: any[] = [];

    for (const volunteer of volunteers || []) {
      const distance = calculateDistance(
        supportRequest.latitude,
        supportRequest.longitude,
        volunteer.location_lat!,
        volunteer.location_lng!
      );

      // Check if volunteer is within their notification radius
      if (distance <= volunteer.notification_radius_km) {
        console.log(`Volunteer ${volunteer.id} is ${distance.toFixed(2)}km away (within ${volunteer.notification_radius_km}km radius)`);
        
        alertsToCreate.push({
          support_request_id: supportRequest.id,
          volunteer_id: volunteer.id,
          status: 'sent',
          distance_km: Math.round(distance * 100) / 100,
        });
      }
    }

    console.log(`Creating ${alertsToCreate.length} volunteer alerts`);

    // Insert alerts
    if (alertsToCreate.length > 0) {
      const { error: alertsError } = await supabaseAdmin
        .from('volunteer_alerts')
        .insert(alertsToCreate);

      if (alertsError) {
        console.error('Error creating alerts:', alertsError);
        throw alertsError;
      }

      // Update support request status to active
      await supabaseAdmin
        .from('support_requests')
        .update({ status: 'active' })
        .eq('id', support_request_id);

      // Log analytics
      await supabaseAdmin
        .from('volunteer_analytics')
        .insert({
          metric_type: 'alerts_sent',
          metric_value: alertsToCreate.length,
          metadata: {
            support_request_id,
            urgency: supportRequest.urgency,
            request_type: supportRequest.request_type,
          },
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alerts_created: alertsToCreate.length,
        message: `Notified ${alertsToCreate.length} volunteers`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in notify-volunteers:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
