import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function expandUrl(shortUrl: string): Promise<string> {
  console.log('🔄 Expanding shortened URL:', shortUrl);
  try {
    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'follow',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to expand URL: ${response.status}`);
    }
    
    const expandedUrl = response.url;
    console.log('✨ Expanded URL:', expandedUrl);
    return expandedUrl;
  } catch (error) {
    console.error('❌ Error expanding URL:', error);
    throw new Error('Failed to expand shortened URL');
  }
}

function extractLocationFromUrl(url: string) {
  console.log('📍 Extracting location from URL:', url);
  
  try {
    const urlObj = new URL(url);
    
    // Try to get coordinates from @lat,lng format
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      return {
        lat: parseFloat(coordsMatch[1]),
        lng: parseFloat(coordsMatch[2])
      };
    }
    
    // Try to get location from the path segments
    const pathSegments = urlObj.pathname.split('/');
    const locationSegment = pathSegments.find(segment => 
      segment.includes('+') || segment.includes(',')
    );
    
    if (locationSegment) {
      const cleanLocation = decodeURIComponent(locationSegment).replace(/\+/g, ' ');
      console.log('📍 Extracted location:', cleanLocation);
      return { location: cleanLocation };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error extracting location:', error);
    return null;
  }
}

function extractRestaurantName(url: string): string | null {
  console.log('🏪 Extracting restaurant name from URL:', url);
  
  try {
    const urlObj = new URL(url);
    
    // Try to extract from place/ format
    const placeMatch = url.match(/place\/([^/@]+)/);
    if (placeMatch) {
      const name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      // Remove any trailing coordinates or additional parameters
      const cleanName = name.split('/')[0];
      console.log('🏪 Extracted name from place format:', cleanName);
      return cleanName;
    }
    
    // Try to get from search parameters
    const searchQuery = urlObj.searchParams.get('q');
    if (searchQuery) {
      console.log('🏪 Extracted name from search query:', searchQuery);
      return searchQuery;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error extracting restaurant name:', error);
    return null;
  }
}

async function searchRestaurant(query: string, location?: { lat?: number, lng?: number, location?: string }) {
  console.log('🔍 Searching for restaurant:', { query, location });
  
  let searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  searchUrl.searchParams.set('key', GOOGLE_API_KEY!);
  
  if (location?.lat && location?.lng) {
    searchUrl.searchParams.set('query', query);
    searchUrl.searchParams.set('location', `${location.lat},${location.lng}`);
    searchUrl.searchParams.set('radius', '100'); // Search within 100 meters of the coordinates
  } else if (location?.location) {
    searchUrl.searchParams.set('query', `${query} ${location.location}`);
  } else {
    searchUrl.searchParams.set('query', query);
  }
  
  try {
    console.log('🌐 Fetching from Places API:', searchUrl.toString());
    const response = await fetch(searchUrl.toString());
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('❌ Places API error:', data);
      throw new Error(`Places API error: ${data.status}`);
    }
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No places found matching the search criteria');
    }
    
    // Get details for the first result
    const placeId = data.results[0].place_id;
    return await getPlaceDetails(placeId);
  } catch (error) {
    console.error('❌ Error in searchRestaurant:', error);
    throw error;
  }
}

async function getPlaceDetails(placeId: string) {
  console.log('🔍 Getting place details for ID:', placeId);
  
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

  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  detailsUrl.searchParams.set('place_id', placeId);
  detailsUrl.searchParams.set('fields', fields);
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY!);
  
  try {
    const response = await fetch(detailsUrl.toString());
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('❌ Place Details API error:', data);
      throw new Error(`Place Details API error: ${data.status}`);
    }
    
    console.log('✨ Successfully fetched place details');
    return data;
  } catch (error) {
    console.error('❌ Error in getPlaceDetails:', error);
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
    console.log('🎯 Processing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    // Expand URL if it's shortened
    const expandedUrl = url.includes('goo.gl') || url.includes('maps.app.goo.gl') 
      ? await expandUrl(url)
      : url;
    
    console.log('📍 Working with URL:', expandedUrl);

    // Extract restaurant name and location
    const restaurantName = extractRestaurantName(expandedUrl);
    const location = extractLocationFromUrl(expandedUrl);

    if (!restaurantName) {
      throw new Error('Could not extract restaurant information from URL');
    }

    // Search for the restaurant using available information
    const placeDetails = await searchRestaurant(restaurantName, location);

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