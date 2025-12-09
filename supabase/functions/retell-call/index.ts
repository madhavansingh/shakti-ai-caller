import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY');
    
    if (!RETELL_API_KEY) {
      console.error('RETELL_API_KEY is not configured');
      throw new Error('RETELL_API_KEY is not configured');
    }

    const { action, agent_id, phone_number } = await req.json();
    console.log('Received request:', { action, agent_id, phone_number });

    if (action === 'create-web-call') {
      // Create a web call for browser-based voice chat
      console.log('Creating web call with agent_id:', agent_id);
      
      const response = await fetch('https://api.retellai.com/v2/create-web-call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RETELL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agent_id,
        }),
      });

      const responseText = await response.text();
      console.log('Retell API response status:', response.status);
      console.log('Retell API response:', responseText);

      if (!response.ok) {
        throw new Error(`Retell API error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'create-phone-call') {
      // Create an outbound phone call
      console.log('Creating phone call to:', phone_number, 'with agent_id:', agent_id);
      
      const response = await fetch('https://api.retellai.com/v2/create-phone-call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RETELL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_number: '+14154154155', // Your Retell phone number
          to_number: phone_number,
          agent_id: agent_id,
        }),
      });

      const responseText = await response.text();
      console.log('Retell API response status:', response.status);
      console.log('Retell API response:', responseText);

      if (!response.ok) {
        throw new Error(`Retell API error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'list-agents') {
      // List all available agents
      console.log('Listing agents');
      
      const response = await fetch('https://api.retellai.com/list-agents', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RETELL_API_KEY}`,
        },
      });

      const responseText = await response.text();
      console.log('Retell API response status:', response.status);
      console.log('Retell API response:', responseText);

      if (!response.ok) {
        throw new Error(`Retell API error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error('Invalid action. Use: create-web-call, create-phone-call, or list-agents');
    }

  } catch (error) {
    console.error('Error in retell-call function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
