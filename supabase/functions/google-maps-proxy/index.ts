import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function expandShortUrl(url: string): Promise<string> {
  console.log('Expanding short URL:', url);
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });
    return response.url;
  } catch (error) {
    console.error('Error expanding URL:', error);
    throw new Error(`Failed to expand shortened URL: ${error.message}`);
  }
}

async function getPlaceDetails(placeId: string) {
  console.log('Fetching place details for ID:', placeId);
  
  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  detailsUrl.searchParams.set('place_id', placeId);
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY!);
  detailsUrl.searchParams.set('fields', 'name,rating,formatted_address,formatted_phone_number,opening_hours,website,price_level,photos,reviews,types,user_ratings_total,utc_offset');

  const response = await fetch(detailsUrl.toString());
  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Place Details API error: ${data.status}`);
  }
  
  return data;
}

async function searchPlace(query: string) {
  console.log('Searching for place:', query);
  
  const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('key', GOOGLE_API_KEY!);

  const response = await fetch(searchUrl.toString());
  const data = await response.json();
  
  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error('No places found matching the search criteria');
  }
  
  return await getPlaceDetails(data.results[0].place_id);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GOOGLE_API_KEY) {
      throw new Error('Google Places API key is not configured');
    }

    const { url } = await req.json();
    console.log('Processing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    // Handle shortened URLs
    let expandedUrl = url;
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      expandedUrl = await expandShortUrl(url);
      console.log('Expanded URL:', expandedUrl);
    }

    // Try to extract place_id from URL
    const urlObj = new URL(expandedUrl);
    const searchParams = new URLSearchParams(urlObj.search);
    const placeId = searchParams.get('place_id');

    let result;
    if (placeId) {
      result = await getPlaceDetails(placeId);
    } else {
      // Extract search terms from the URL path
      const pathSegments = urlObj.pathname.split('/').filter(segment => 
        segment && !segment.includes('maps') && !segment.includes('http')
      );
      const searchQuery = pathSegments.join(' ');
      result = await searchPlace(searchQuery);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing request:', error);
    
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