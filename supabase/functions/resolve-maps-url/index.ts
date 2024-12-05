import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function resolveShortUrl(url: string): Promise<string> {
  console.log('Resolving shortened URL:', url);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to resolve URL: ${response.status}`);
    }
    
    const finalUrl = response.url;
    console.log('Resolved to:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('Error resolving shortened URL:', error);
    throw error;
  }
}

async function getPlaceDetails(placeId: string) {
  console.log('Fetching place details for:', placeId);
  const fields = [
    'name',
    'rating',
    'formatted_address',
    'formatted_phone_number',
    'opening_hours',
    'photos',
    'price_level',
    'reviews',
    'types',
    'user_ratings_total',
    'vicinity',
    'website',
    'utc_offset'
  ].join(',');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Place Details API error: ${data.status}`);
  }
  
  return data.result;
}

async function findPlaceFromText(query: string) {
  console.log('Searching for place:', query);
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${GOOGLE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Find Place API error: ${data.status}`);
  }
  
  return data.candidates[0];
}

function extractPlaceId(url: string): string | null {
  console.log('Attempting to extract Place ID from:', url);
  try {
    const urlObj = new URL(url);
    
    // Check for place_id in query parameters
    const placeId = urlObj.searchParams.get('place_id');
    if (placeId) {
      console.log('Found place_id in query params:', placeId);
      return placeId;
    }
    
    // Check for place ID in the path
    const pathMatch = url.match(/place\/[^/]+\/([^/?]+)/);
    if (pathMatch && pathMatch[1].startsWith('ChIJ')) {
      console.log('Found place_id in path:', pathMatch[1]);
      return pathMatch[1];
    }
    
    // Extract from the data parameter
    const dataParam = urlObj.searchParams.get('data');
    if (dataParam) {
      const placeIdMatch = dataParam.match(/!1s(ChIJ[^!]+)!/);
      if (placeIdMatch) {
        console.log('Found place_id in data parameter:', placeIdMatch[1]);
        return placeIdMatch[1];
      }
    }
    
    // Try to get location from URL
    const coords = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coords) {
      console.log('Found coordinates:', coords[1], coords[2]);
      return null; // We'll handle this case by searching nearby
    }
    
    console.log('No Place ID found in URL');
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GOOGLE_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const { url } = await req.json();
    console.log('Processing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    // Handle shortened URLs
    let resolvedUrl = url;
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
      console.log('Detected shortened URL, resolving...');
      resolvedUrl = await resolveShortUrl(url);
      console.log('Resolved URL:', resolvedUrl);
    }

    // Try to extract Place ID
    let placeId = extractPlaceId(resolvedUrl);
    
    // If no Place ID found, try to search by location or query
    if (!placeId) {
      console.log('No Place ID found, attempting to search by URL components');
      try {
        const urlObj = new URL(resolvedUrl);
        const searchQuery = urlObj.searchParams.get('q') || 
                          urlObj.pathname.split('/').pop() || 
                          resolvedUrl;
        
        console.log('Searching for place with query:', searchQuery);
        const place = await findPlaceFromText(searchQuery);
        placeId = place.place_id;
        console.log('Found Place ID through search:', placeId);
      } catch (error) {
        console.error('Error searching for place:', error);
        throw new Error('Could not find place ID');
      }
    }

    if (!placeId) {
      throw new Error('Could not extract or find Place ID');
    }

    const placeDetails = await getPlaceDetails(placeId);
    
    return new Response(JSON.stringify(placeDetails), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});