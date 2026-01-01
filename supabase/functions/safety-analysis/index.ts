import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
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
        systemPrompt = `You are a personal safety expert. Provide practical safety tips based on the context. Be specific and actionable.`;
        userPrompt = `Provide 5 safety tips for: ${data.context}`;
        break;
      
      default:
        throw new Error('Unknown analysis type');
    }

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
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
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
