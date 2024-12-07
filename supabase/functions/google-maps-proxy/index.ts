import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { searchRestaurant } from "./placesApi.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 Edge function started');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('👋 Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Received request:', req.method);
    
    const body = await req.json().catch(() => {
      console.error('❌ Failed to parse request body');
      throw new Error('Invalid request body');
    });
    
    const { url, placeId } = body;
    console.log('🔍 Processing request with:', { url, placeId });

    if (!url && !placeId) {
      console.error('❌ Missing required parameters');
      throw new Error('Either URL or placeId is required');
    }

    // Set a timeout for the restaurant search
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.error('⏰ Request timed out');
        reject(new Error('Request timed out after 25 seconds'));
      }, 25000);
    });

    console.log('🔎 Starting restaurant search...');
    const result = await Promise.race([
      searchRestaurant(url, placeId),
      timeoutPromise
    ]);

    if (!result) {
      console.error('❌ No result returned from search');
      throw new Error('Failed to retrieve restaurant data');
    }

    console.log('✅ Successfully found restaurant data');

    return new Response(
      JSON.stringify({ result }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Edge function error:', error);
    
    const errorResponse = {
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: error.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});