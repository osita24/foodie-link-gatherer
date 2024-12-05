import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { searchRestaurant } from "./urlParser.ts";
import { getPlaceDetails } from "./placesApi.ts";

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
    console.log('🔍 Received request:', req.method);
    
    const body = await req.json().catch(() => {
      throw new Error('Failed to parse request body');
    });
    
    const { url, placeId } = body;
    console.log('📝 Request parameters:', { url, placeId });

    if (!url && !placeId) {
      throw new Error('Either URL or placeId is required');
    }

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    let finalPlaceId = placeId;
    
    // If URL is provided, extract place ID from it
    if (url) {
      console.log('🔎 Extracting place ID from URL:', url);
      finalPlaceId = await searchRestaurant(url, apiKey);
      console.log('✅ Extracted place ID:', finalPlaceId);
    }

    if (!finalPlaceId) {
      throw new Error('Failed to determine place ID');
    }

    console.log('🔎 Fetching place details...');
    const result = await getPlaceDetails(finalPlaceId, apiKey);
    console.log('✅ Successfully fetched place details');

    return new Response(
      JSON.stringify({ result }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});