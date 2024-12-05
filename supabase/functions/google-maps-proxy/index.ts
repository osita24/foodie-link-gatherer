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
    const { url } = await req.json();
    console.log('🔍 Processing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    // Get the expanded URL if it's a shortened one
    let fullUrl = url;
    if (url.includes('goo.gl')) {
      console.log('📎 Expanding shortened URL...');
      const response = await fetch(url, { redirect: 'follow' });
      fullUrl = response.url;
      console.log('📎 Expanded URL:', fullUrl);
    }

    // Search directly with the URL text
    console.log('🔎 Searching for restaurant...');
    const result = await searchRestaurant(fullUrl);
    console.log('✅ Found restaurant details:', result);

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