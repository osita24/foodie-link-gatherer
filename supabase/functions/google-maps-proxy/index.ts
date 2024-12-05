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

    // If it's a shortened URL, expand it first
    let finalUrl = url;
    if (url?.includes('goo.gl') || url?.includes('maps.app.goo.gl')) {
      console.log('📎 Expanding shortened URL:', url);
      try {
        const response = await fetch(url, { redirect: 'follow' });
        finalUrl = response.url;
        console.log('📎 Expanded URL:', finalUrl);
      } catch (error) {
        console.error('❌ Error expanding URL:', error);
        throw new Error('Failed to expand shortened URL');
      }
    }

    // Search directly with the URL text or get details with placeId
    console.log('🔎 Fetching restaurant details...');
    const result = await searchRestaurant(finalUrl, placeId);
    console.log('✅ Found restaurant details');

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    
    // Return a more detailed error response
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});