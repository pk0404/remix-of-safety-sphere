import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication - require valid JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Parse request body
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'analyze_location':
        systemPrompt = `You are a safety analysis AI. Analyze the given location and provide safety information. Be concise and helpful. Return a JSON object with: riskLevel (low/medium/high), safetyTips (array of 3 tips), nearbyResources (array of suggested places to go).`;
        userPrompt = `Analyze safety for location: Latitude ${data.latitude}, Longitude ${data.longitude}. Time: ${new Date().toLocaleTimeString()}`;
        break;
      
      case 'generate_alert':
        systemPrompt = `You are an emergency alert assistant. Generate a clear, urgent emergency message based on the situation. Keep it under 160 characters for SMS compatibility.`;
        userPrompt = `Generate emergency message for: ${data.situation}. Location: ${data.location}`;
        break;
      
      case 'safety_tips':
        systemPrompt = `You are a personal safety expert. Provide practical, actionable safety advice. Be concise but thorough. Format your response in clear paragraphs.`;
        userPrompt = `Provide safety tips and advice for this situation: ${data.context}. ${data.location ? `User's location: ${data.location}` : ''}`;
        break;

      case 'nearby_places':
        systemPrompt = `You are a safety location advisor. Return a JSON array of nearby safety locations. Each object should have: name (string), type (police/hospital/fire_station/safe_zone), distance (string like "0.5 km"), phone (emergency number). Return exactly 5 places.`;
        userPrompt = `List 5 nearby safety locations (police stations, hospitals, fire stations, safe zones) near coordinates: ${data.latitude}, ${data.longitude}. Return as JSON array only.`;
        break;
      
      default:
        console.error('Unknown analysis type:', type);
        throw new Error('Unknown analysis type');
    }

    console.log('Processing request type:', type, 'for user:', user.id);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limit exceeded for user:', user.id);
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.warn('AI credits exhausted');
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    console.log('Successfully processed request for user:', user.id);

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Safety analysis error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
