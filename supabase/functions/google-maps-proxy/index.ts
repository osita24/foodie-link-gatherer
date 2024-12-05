import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { expandUrl } from "./urlExpander.ts";
import { parseGoogleMapsUrl } from "./urlParser.ts";
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
    const { url } = await req.json();
    console.log('🎯 Processing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    // Step 1: Expand the URL if it's shortened
    const expandedUrl = await expandUrl(url);
    console.log('📍 Working with expanded URL:', expandedUrl);

    // Step 2: Parse the URL to extract restaurant info
    const { name, location } = parseGoogleMapsUrl(expandedUrl);
    
    if (!name) {
      throw new Error('Could not extract restaurant information from URL');
    }

    // Step 3: Search for the restaurant using available information
    const placeDetails = await searchRestaurant(name, location);

    return new Response(JSON.stringify(placeDetails), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});