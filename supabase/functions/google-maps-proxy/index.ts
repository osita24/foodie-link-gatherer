import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Processing URL:', url)

    // First, expand the shortened URL if needed
    let expandedUrl = url
    if (url.includes('maps.app.goo.gl')) {
      console.log('Expanding shortened URL')
      const response = await fetch(url, { 
        method: 'GET',
        redirect: 'follow'
      })
      
      // Get the final URL after all redirects
      expandedUrl = response.url
      console.log('Expanded URL:', expandedUrl)

      // For shortened URLs, we'll use the coordinates from the URL
      const coords = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (coords) {
        console.log('Found coordinates:', coords[1], coords[2])
        
        // Use Places API Nearby Search with coordinates
        const nearbyUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
        nearbyUrl.searchParams.set('location', `${coords[1]},${coords[2]}`)
        nearbyUrl.searchParams.set('radius', '50') // Small radius since we know exact location
        nearbyUrl.searchParams.set('key', GOOGLE_API_KEY)

        console.log('Making Nearby Search request')
        const nearbyResponse = await fetch(nearbyUrl.toString())
        const nearbyData = await nearbyResponse.json()
        console.log('Nearby Search response:', nearbyData)

        if (nearbyData.results?.[0]?.place_id) {
          // Get detailed place information
          const placeId = nearbyData.results[0].place_id
          console.log('Found place ID from coordinates:', placeId)

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
          console.log('Place Details response:', detailsData)

          return new Response(
            JSON.stringify(detailsData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
      
      throw new Error('Could not find restaurant at coordinates')
    }

    // For regular URLs, try to extract search query
    let searchQuery = ''
    try {
      const urlObj = new URL(expandedUrl)
      
      if (urlObj.searchParams.has('q')) {
        searchQuery = urlObj.searchParams.get('q') || ''
      } else {
        // Try to extract from the path
        const pathParts = urlObj.pathname.split('/').filter(Boolean)
        if (pathParts.length > 0) {
          searchQuery = decodeURIComponent(pathParts[pathParts.length - 1]).replace(/\+/g, ' ')
        }
      }
      
      console.log('Extracted search query:', searchQuery)
    } catch (error) {
      console.error('Error parsing URL:', error)
      throw new Error('Invalid URL format')
    }

    if (!searchQuery) {
      throw new Error('Could not extract search query from URL')
    }

    // Use Places API Text Search to find the place
    console.log('Making Text Search request with query:', searchQuery)
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    searchUrl.searchParams.set('query', searchQuery)
    searchUrl.searchParams.set('key', GOOGLE_API_KEY)

    const searchResponse = await fetch(searchUrl.toString())
    const searchData = await searchResponse.json()
    console.log('Text Search response:', searchData)
    
    if (!searchData.results?.[0]?.place_id) {
      console.error('No place found in search results:', searchData)
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
    console.log('Place Details response:', detailsData)

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