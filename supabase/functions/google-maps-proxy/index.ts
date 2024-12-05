import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, params } = await req.json();
    console.log('Proxy received request for endpoint:', endpoint, 'with params:', params);

    // Construct the Google Maps API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/place';
    const url = `${baseUrl}/${endpoint}?${new URLSearchParams({
      ...params,
      key: GOOGLE_API_KEY
    })}`;

    console.log('Making request to:', url);

    // Make the request to Google Maps API
    const response = await fetch(url);
    const data = await response.json();

    console.log('Received response:', data);

    // Return the response with CORS headers
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in google-maps-proxy:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});