import { serve } from "https://deno.fresh.run/std@v9.6.1/http/server.ts";

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  url: string;
}

async function resolveShortUrl(url: string): Promise<string> {
  console.log('Resolving short URL:', url);
  try {
    const response = await fetch(url, { redirect: 'follow' });
    console.log('Resolved URL:', response.url);
    return response.url;
  } catch (error) {
    console.error('Error resolving URL:', error);
    throw new Error(`Failed to resolve URL: ${error.message}`);
  }
}

function extractPlaceId(url: string): string | null {
  console.log('Extracting Place ID from:', url);
  try {
    // Handle direct Place IDs
    if (url.startsWith('ChIJ') || url.startsWith('0x')) {
      return url;
    }

    const urlObj = new URL(url);
    
    // Check for place_id in query parameters
    const placeId = urlObj.searchParams.get('place_id');
    if (placeId) {
      return placeId;
    }

    // Check for place ID in the path
    const pathMatch = url.match(/place\/[^/]+\/([^/?]+)/);
    if (pathMatch && pathMatch[1].startsWith('ChIJ')) {
      return pathMatch[1];
    }

    // Check for place ID in the data parameter
    const dataParam = urlObj.searchParams.get('data');
    if (dataParam) {
      const placeIdMatch = dataParam.match(/!1s(ChIJ[^!]+)!/);
      if (placeIdMatch) {
        return placeIdMatch[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting Place ID:', error);
    return null;
  }
}

async function searchPlace(query: string) {
  console.log('Searching for place:', query);
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${GOOGLE_API_KEY}`
    );
    
    const data = await response.json();
    console.log('Place search response:', data);
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0];
    }
    
    throw new Error('No places found');
  } catch (error) {
    console.error('Error searching place:', error);
    throw error;
  }
}

async function getPlaceDetails(placeId: string) {
  console.log('Fetching place details for:', placeId);
  try {
    const fields = [
      'name',
      'rating',
      'user_ratings_total',
      'formatted_address',
      'formatted_phone_number',
      'opening_hours',
      'website',
      'price_level',
      'photos',
      'reviews',
      'types',
      'vicinity',
      'utc_offset'
    ].join(',');

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`
    );
    
    const data = await response.json();
    console.log('Place details response status:', data.status);
    
    if (data.status === 'OK') {
      return data.result;
    }
    
    throw new Error(`Failed to get place details: ${data.status}`);
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
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

    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { url } = await req.json() as RequestBody;
    console.log('Processing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    let resolvedUrl = url;
    // Resolve short URLs if necessary
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      resolvedUrl = await resolveShortUrl(url);
    }

    // Try to extract Place ID
    let placeId = extractPlaceId(resolvedUrl);
    
    // If no Place ID found, try to search for the place
    if (!placeId) {
      console.log('No Place ID found, searching by URL components');
      try {
        const urlObj = new URL(resolvedUrl);
        const query = urlObj.searchParams.get('q') || urlObj.pathname.split('/').pop();
        if (query) {
          const place = await searchPlace(query);
          placeId = place.place_id;
        }
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