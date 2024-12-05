import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

async function searchPlace(query: string) {
  console.log('🔍 Searching for place:', query);
  
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
  
  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('❌ Place Search API error:', data);
      throw new Error(`Place Search API error: ${data.status}`);
    }
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No places found matching the search criteria');
    }
    
    console.log('✨ Found place:', data.results[0]);
    return data.results[0];
  } catch (error) {
    console.error('Error in searchPlace:', error);
    throw error;
  }
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
  
  try {
    console.log('🔍 Fetching place details for ID:', placeId);
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('❌ Google Places API error:', data);
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    console.log('✨ Successfully fetched place details');
    return data;
  } catch (error) {
    console.error('Error in fetchPlaceDetails:', error);
    throw error;
  }
}

function extractRestaurantName(url: string): string {
  console.log('📍 Extracting restaurant name from URL:', url);
  
  try {
    // Try to extract from place/ format
    const placeMatch = url.match(/place\/([^/@]+)/);
    if (placeMatch) {
      const name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      // Remove any trailing coordinates or additional parameters
      return name.split('/')[0];
    }
    
    // If no match found, try to get it from the URL parameters
    const urlObj = new URL(url);
    const queryName = urlObj.searchParams.get('q');
    if (queryName) {
      return queryName;
    }
    
    throw new Error('Could not extract restaurant name from URL');
  } catch (error) {
    console.error('Error extracting restaurant name:', error);
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

    // Extract restaurant name from URL
    const restaurantName = extractRestaurantName(url);
    console.log('📝 Extracted restaurant name:', restaurantName);

    // Search for the place using the extracted name
    const searchResult = await searchPlace(restaurantName);
    
    // Get detailed information using the place ID
    const placeDetails = await fetchPlaceDetails(searchResult.place_id);

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