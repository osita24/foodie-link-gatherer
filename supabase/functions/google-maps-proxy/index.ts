import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, expandShortenedUrl, extractCoordinates } from "./urlUtils.ts"
import { searchNearbyRestaurants, getPlaceDetails } from "./placesApi.ts"

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Processing URL:', url)

    // First, handle shortened URLs
    let finalUrl = url
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
      finalUrl = await expandShortenedUrl(url)
    }

    // Extract coordinates from the URL
    const coords = extractCoordinates(finalUrl)
    if (!coords) {
      console.error('Could not extract coordinates from URL:', finalUrl)
      throw new Error('Could not extract coordinates from URL')
    }

    // Search for nearby restaurants
    const nearbyPlace = await searchNearbyRestaurants(coords.lat, coords.lng)
    
    // Get detailed place information
    const detailsData = await getPlaceDetails(nearbyPlace.place_id)

    return new Response(
      JSON.stringify(detailsData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})