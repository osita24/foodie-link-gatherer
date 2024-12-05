import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

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

async function findPlaceBySearch(query: string, location?: { lat: number, lng: number }) {
  console.log('🔍 Searching for place:', query, location);
  
  let searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,geometry&key=${GOOGLE_API_KEY}`;
  
  if (location) {
    searchUrl += `&locationbias=point:${location.lat},${location.lng}`;
  }
  
  const response = await fetch(searchUrl);
  const data = await response.json();
  
  if (data.status !== 'OK') {
    console.error('❌ Place Search API error:', data);
    throw new Error(`Place Search API error: ${data.status}`);
  }
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No places found matching the search criteria');
  }
  
  console.log('✨ Found place:', data.candidates[0]);
  return data.candidates[0];
}

async function fetchPlaceDetails(placeId: string) {
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
    'user_ratings_total',
    'utc_offset'
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

function extractLocationInfo(url: string) {
  console.log('📍 Extracting location info from URL:', url);
  
  const result: { name?: string; lat?: number; lng?: number; placeId?: string } = {};
  
  // Try to extract place name
  const nameMatch = url.match(/place\/([^/@]+)/);
  if (nameMatch) {
    result.name = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
  }
  
  // Try to extract coordinates
  const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    result.lat = parseFloat(coordsMatch[1]);
    result.lng = parseFloat(coordsMatch[2]);
  }
  
  // Try various place ID patterns
  const placeIdPatterns = [
    /place\/[^/]+\/(ChIJ[^/?]+)/, // Standard format
    /!1s(ChIJ[^!]+)!/, // Alternate format
    /place_id=(ChIJ[^&]+)/ // URL parameter format
  ];
  
  for (const pattern of placeIdPatterns) {
    const match = url.match(pattern);
    if (match) {
      result.placeId = match[1];
      break;
    }
  }
  
  console.log('✨ Extracted location info:', result);
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('🎯 Processing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    // Handle both shortened and full URLs
    const finalUrl = url.includes('goo.gl') ? await expandUrl(url) : url;
    console.log('📍 Final URL to process:', finalUrl);

    // Extract all possible location information
    const locationInfo = extractLocationInfo(finalUrl);
    console.log('📝 Extracted location info:', locationInfo);

    let placeDetails;
    
    // Strategy 1: Try using place ID if available
    if (locationInfo.placeId) {
      try {
        placeDetails = await fetchPlaceDetails(locationInfo.placeId);
      } catch (error) {
        console.log('⚠️ Failed to fetch by place ID, trying alternative methods');
      }
    }
    
    // Strategy 2: Try searching by name and location if available
    if (!placeDetails && locationInfo.name) {
      try {
        const searchResult = await findPlaceBySearch(
          locationInfo.name,
          locationInfo.lat && locationInfo.lng ? { lat: locationInfo.lat, lng: locationInfo.lng } : undefined
        );
        placeDetails = await fetchPlaceDetails(searchResult.place_id);
      } catch (error) {
        console.log('⚠️ Failed to find place by name and location');
      }
    }
    
    // If we still don't have details, throw an error
    if (!placeDetails) {
      throw new Error('Could not find restaurant details using available information');
    }

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