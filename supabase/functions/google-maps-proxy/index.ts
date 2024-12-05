import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

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

async function extractPlaceId(url: string): Promise<string | null> {
  console.log('🔍 Extracting place ID from URL:', url);
  try {
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    
    // Try to get place_id from URL parameters
    if (searchParams.has('place_id')) {
      const placeId = searchParams.get('place_id');
      console.log('✅ Found place_id in URL params:', placeId);
      return placeId;
    }

    // Try to extract from the URL path
    const pathMatch = url.match(/place\/[^/]+\/([^/]+)/);
    if (pathMatch && pathMatch[1] && pathMatch[1].startsWith('ChIJ')) {
      console.log('✅ Found place_id in URL path:', pathMatch[1]);
      return pathMatch[1];
    }

    // Try to extract from the data parameter
    const dataParam = searchParams.get('data');
    if (dataParam) {
      const placeIdMatch = dataParam.match(/!1s(ChIJ[^!]+)!/);
      if (placeIdMatch && placeIdMatch[1]) {
        console.log('✅ Found place_id in data parameter:', placeIdMatch[1]);
        return placeIdMatch[1];
      }
    }

    // If no place ID found, try to extract the query
    const query = url.split('/place/')[1]?.split('/')[0];
    if (query) {
      return await searchPlaceIdByQuery(decodeURIComponent(query.replace(/\+/g, ' ')));
    }

    console.log('❌ No place_id found in URL');
    return null;
  } catch (error) {
    console.error('❌ Error parsing URL:', error);
    return null;
  }
}

async function searchPlaceIdByQuery(query: string): Promise<string | null> {
  console.log('🔍 Searching for place ID by query:', query);
  
  const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('key', GOOGLE_API_KEY!);

  try {
    const response = await fetch(searchUrl.toString());
    const data = await response.json();
    
    if (data.status === 'OK' && data.results?.[0]?.place_id) {
      console.log('✅ Found place_id through search:', data.results[0].place_id);
      return data.results[0].place_id;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error searching for place:', error);
    return null;
  }
}

async function getPlaceDetails(placeId: string) {
  console.log('🔍 Getting place details for ID:', placeId);
  
  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  detailsUrl.searchParams.set('place_id', placeId);
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY!);
  detailsUrl.searchParams.set('fields', 'name,rating,formatted_address,formatted_phone_number,opening_hours,website,price_level,photos,reviews,types,user_ratings_total,utc_offset,place_id');

  try {
    const response = await fetch(detailsUrl.toString());
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Place Details API error: ${data.status}`);
    }
    
    console.log('✅ Successfully retrieved place details');
    return data;
  } catch (error) {
    console.error('❌ Error fetching place details:', error);
    throw error;
  }
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
    console.log('🌐 Processing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    // Step 1: Expand shortened URL if necessary
    const expandedUrl = await expandShortUrl(url);
    console.log('📍 Working with URL:', expandedUrl);

    // Step 2: Extract place ID from the expanded URL
    const placeId = await extractPlaceId(expandedUrl);
    if (!placeId) {
      throw new Error('Could not find place ID from the provided URL');
    }

    // Step 3: Get place details
    const placeDetails = await getPlaceDetails(placeId);

    return new Response(JSON.stringify(placeDetails), {
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