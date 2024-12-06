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
    console.log('🔍 Received request:', req.method);
    
    const body = await req.json().catch(() => ({}));
    const { url, placeId } = body;
    
    console.log('📝 Request parameters:', { url, placeId });

    if (!url && !placeId) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({ 
          error: 'Either URL or placeId is required',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔎 Fetching restaurant details...');
    const result = await searchRestaurant(url, placeId);
    console.log('✅ Found restaurant details');

    return new Response(
      JSON.stringify({ result }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    
    // Create a more detailed error response
    const errorResponse = {
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: error.status || 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});