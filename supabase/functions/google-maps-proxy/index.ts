import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "./urlUtils.ts"

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Processing URL:', url)

    if (!url) {
      throw new Error('URL is required')
    }

    // First try to get place_id from the URL if it exists
    const placeIdMatch = url.match(/place_id=([^&]+)/)
    let placeId = placeIdMatch ? placeIdMatch[1] : null

    if (!placeId) {
      // If no place_id in URL, extract search terms
      const searchTerms = url.split('/').filter(term => 
        term && !term.includes('maps') && !term.includes('http') && !term.includes('google')
      ).join(' ')

      console.log('Searching for:', searchTerms)

      // Search for the place using Google Places API
      const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
      searchUrl.searchParams.set('query', searchTerms)
      searchUrl.searchParams.set('key', GOOGLE_API_KEY!)

      const searchResponse = await fetch(searchUrl)
      const searchData = await searchResponse.json()

      if (!searchData.results?.[0]?.place_id) {
        throw new Error('No results found')
      }

      placeId = searchData.results[0].place_id
    }

    // Get place details
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    detailsUrl.searchParams.set('place_id', placeId)
    detailsUrl.searchParams.set('fields', 'name,rating,formatted_address,formatted_phone_number,opening_hours,website,price_level,photos,reviews,types,user_ratings_total,utc_offset')
    detailsUrl.searchParams.set('key', GOOGLE_API_KEY!)

    console.log('Fetching details for place_id:', placeId)
    
    const detailsResponse = await fetch(detailsUrl)
    const detailsData = await detailsResponse.json()

    if (detailsData.status !== 'OK' || !detailsData.result) {
      throw new Error('Could not fetch place details')
    }

    return new Response(JSON.stringify(detailsData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})