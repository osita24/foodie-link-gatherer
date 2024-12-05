import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  url: string;
}

async function expandUrl(shortUrl: string): Promise<string> {
  console.log('🔍 Starting URL expansion for:', shortUrl);
  try {
    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const expandedUrl = response.url;
    console.log('✨ Successfully expanded URL to:', expandedUrl);
    return expandedUrl;
  } catch (error) {
    console.error('❌ Error expanding URL:', error);
    throw error;
  }
}

async function fetchPlaceDetails(placeId: string) {
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!GOOGLE_API_KEY) {
    throw new Error('Google Places API key not configured');
  }

  const fields = [
    'name',
    'rating',
    'formatted_address',
    'formatted_phone_number',
    'opening_hours',
    'website',
    'price_level',
    'photos',
    'reviews',
    'types',
    'user_ratings_total'
  ].join(',');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
  
  console.log('🔍 Fetching place details for ID:', placeId);
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK') {
    console.error('❌ Google Places API error:', data);
    throw new Error(`Google Places API error: ${data.status}`);
  }
  
  console.log('✨ Successfully fetched place details');
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json() as RequestBody;
    console.log('🎯 Processing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    // Handle both shortened and full URLs
    const finalUrl = url.includes('goo.gl') ? await expandUrl(url) : url;
    console.log('📍 Final URL to process:', finalUrl);

    // Extract place ID from URL
    const placeIdMatch = finalUrl.match(/place\/.+\/(ChIJ[^/?]+)/);
    if (!placeIdMatch) {
      console.error('❌ No place ID found in URL');
      throw new Error('Could not find place ID in URL');
    }

    const placeId = placeIdMatch[1];
    console.log('🏷️ Extracted Place ID:', placeId);

    // Fetch place details from Google Places API
    const placeDetails = await fetchPlaceDetails(placeId);

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
})