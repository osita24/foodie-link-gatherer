import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { searchRestaurant } from "./placesApi.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, placeId } = await req.json();
    console.log('🔍 Processing request:', { url, placeId });

    if (!url && !placeId) {
      throw new Error('Either URL or placeId is required');
    }

    // Search directly with the URL text or get details with placeId
    console.log('🔎 Fetching restaurant details...');
    const result = await searchRestaurant(url, placeId);
    console.log('✅ Found restaurant details');

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});