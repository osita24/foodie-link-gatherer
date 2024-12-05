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
    
    // Additional validation
    if (!expandedUrl || !expandedUrl.includes('google.com/maps')) {
      console.error('❌ Invalid expanded URL:', expandedUrl);
      throw new Error('Invalid expanded URL');
    }
    
    return expandedUrl;
  } catch (error) {
    console.error('❌ Error expanding URL:', error);
    throw error;
  }
}

function extractPlaceDetails(url: string) {
  console.log('📍 Extracting place details from URL:', url);
  
  try {
    // Extract place name from URL
    const nameMatch = url.match(/place\/([^/@]+)/);
    const name = nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')) : null;
    
    // Extract coordinates
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const latitude = coordsMatch ? coordsMatch[1] : null;
    const longitude = coordsMatch ? coordsMatch[2] : null;
    
    // Extract place ID
    const placeIdMatch = url.match(/!1s([^!]+)!8m/);
    const placeId = placeIdMatch ? placeIdMatch[1] : null;
    
    console.log('✨ Extracted details:', { name, latitude, longitude, placeId });
    
    if (!name || !latitude || !longitude) {
      throw new Error('Could not extract required place details from URL');
    }
    
    return {
      name: name.replace(/\+/g, ' '),
      latitude,
      longitude,
      id: placeId || `${latitude},${longitude}` // Fallback ID if place ID not found
    };
  } catch (error) {
    console.error('❌ Error extracting place details:', error);
    throw new Error('Failed to extract place details from URL');
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
  
  try {
    console.log('🔍 Fetching place details from Google Places API');
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('❌ Google Places API error:', data);
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    console.log('✨ Successfully fetched place details');
    return data;
  } catch (error) {
    console.error('❌ Error fetching place details:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    // Extract basic details from the URL
    const placeDetails = extractPlaceDetails(finalUrl);
    console.log('📝 Extracted place details:', placeDetails);

    // If we have a place ID, fetch additional details from Google Places API
    let fullDetails = null;
    if (placeDetails.id && placeDetails.id.startsWith('ChIJ')) {
      fullDetails = await fetchPlaceDetails(placeDetails.id);
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        result: fullDetails?.result || {
          place_id: placeDetails.id,
          name: placeDetails.name,
          geometry: {
            location: {
              lat: parseFloat(placeDetails.latitude),
              lng: parseFloat(placeDetails.longitude)
            }
          }
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
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