import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Processing URL:', url)

    // First, expand the shortened URL if needed
    let expandedUrl = url
    if (url.includes('goo.gl')) {
      console.log('Expanding shortened URL')
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
      })
      expandedUrl = response.url
      console.log('Expanded URL:', expandedUrl)
    }

    // Extract location information from the URL
    let searchQuery = ''
    try {
      const urlObj = new URL(expandedUrl)
      
      // Handle different URL formats
      if (urlObj.searchParams.has('q')) {
        searchQuery = urlObj.searchParams.get('q') || ''
      } else {
        // For app.goo.gl links, extract location from the path
        const pathParts = urlObj.pathname.split('/').filter(Boolean)
        if (pathParts.length > 0) {
          const lastPart = decodeURIComponent(pathParts[pathParts.length - 1])
          searchQuery = lastPart.replace(/\+/g, ' ')
        }
      }
    } catch (error) {
      console.error('Error parsing URL:', error)
      throw new Error('Invalid URL format')
    }

    if (!searchQuery) {
      throw new Error('Could not extract location from URL')
    }

    console.log('Search query:', searchQuery)

    // Use Places API Text Search to find the place
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    searchUrl.searchParams.set('query', searchQuery)
    searchUrl.searchParams.set('key', GOOGLE_API_KEY)

    console.log('Making Text Search request')
    const searchResponse = await fetch(searchUrl.toString())
    const searchData = await searchResponse.json()

    if (!searchData.results?.[0]?.place_id) {
      console.error('No place found:', searchData)
      throw new Error('No place found')
    }

    // Get detailed place information
    const placeId = searchData.results[0].place_id
    console.log('Found place ID:', placeId)

    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    detailsUrl.searchParams.set('place_id', placeId)
    detailsUrl.searchParams.set('key', GOOGLE_API_KEY)
    detailsUrl.searchParams.set('fields', [
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
    ].join(','))

    console.log('Fetching place details')
    const detailsResponse = await fetch(detailsUrl.toString())
    const detailsData = await detailsResponse.json()

    if (!detailsData.result) {
      console.error('No details found:', detailsData)
      throw new Error('Could not fetch place details')
    }

    return new Response(
      JSON.stringify(detailsData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})