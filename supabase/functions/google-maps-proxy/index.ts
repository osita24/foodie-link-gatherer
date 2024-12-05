import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { extractRestaurantInfo } from "./urlParser.ts";
import { searchRestaurant } from "./placesApi.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function expandShortUrl(url: string): Promise<string> {
  console.log('🔄 Expanding URL:', url);
  
  // If it's not a shortened URL, return as is
  if (!url.includes('goo.gl') && !url.includes('maps.app.goo.gl')) {
    return url;
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });
    
    console.log('📍 Expanded URL:', response.url);
    return response.url;
  } catch (error) {
    console.error('❌ Error expanding URL:', error);
    throw new Error(`Failed to expand shortened URL: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('🌐 Processing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    // Step 1: Expand shortened URL if necessary
    const expandedUrl = await expandShortUrl(url);
    console.log('📍 Working with expanded URL:', expandedUrl);

    // Step 2: Extract restaurant name and location from the URL
    const restaurantInfo = extractRestaurantInfo(expandedUrl);
    console.log('🏪 Extracted restaurant info:', restaurantInfo);

    // Step 3: Search for restaurant using extracted information
    const restaurantDetails = await searchRestaurant(
      restaurantInfo.name,
      restaurantInfo.location
    );

    return new Response(JSON.stringify(restaurantDetails), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
})