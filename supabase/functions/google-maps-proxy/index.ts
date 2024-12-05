import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function expandUrl(shortUrl: string): Promise<string> {
  console.log('Starting URL expansion for:', shortUrl)
  try {
    // Use GET instead of HEAD to ensure we get the full redirect chain
    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'follow'
    })
    
    // Get the final URL after all redirects
    const finalUrl = response.url
    console.log('Final expanded URL:', finalUrl)
    
    // For debugging, log the response status
    console.log('Response status:', response.status)
    
    return finalUrl
  } catch (error) {
    console.error('Error expanding URL:', error)
    throw new Error(`Failed to expand shortened URL: ${error.message}`)
  }
}

function extractCoordinates(url: string): { lat: string, lng: string } {
  console.log('Attempting to extract coordinates from:', url)
  
  // Try different URL patterns
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/, // Standard format
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // Alternate format
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // Another format
    /center=(-?\d+\.\d+),(-?\d+\.\d+)/, // Center parameter format
    /data=!3m1!4b1!4m[0-9]+!3m[0-9]+!1s0x[0-9a-f]+:0x[0-9a-f]+!8m2!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/ // Complex format
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      // For the complex format, coordinates are in different group positions
      const lat = match[1]
      const lng = match[2]
      console.log('Found coordinates:', lat, lng)
      return { lat, lng }
    }
  }

  throw new Error('Could not extract coordinates from URL')
}

async function findRestaurantFromCoordinates(lat: string, lng: string) {
  console.log('Searching for restaurant at coordinates:', lat, lng)
  
  // First search for nearby restaurants with increased radius
  const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&type=restaurant&key=${GOOGLE_API_KEY}`
  
  console.log('Making request to Places API:', nearbyUrl)
  const nearbyResponse = await fetch(nearbyUrl)
  
  if (!nearbyResponse.ok) {
    const errorText = await nearbyResponse.text()
    console.error('Places API error:', errorText)
    throw new Error(`Places API error: ${nearbyResponse.status}`)
  }
  
  const nearbyData = await nearbyResponse.json()
  console.log('Places API response status:', nearbyData.status)
  console.log('Number of results:', nearbyData.results?.length || 0)
  
  if (nearbyData.status !== 'OK' || !nearbyData.results?.length) {
    throw new Error('No restaurants found at these coordinates')
  }

  // Get details for the first (closest) restaurant
  const placeId = nearbyData.results[0].place_id
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}&fields=place_id,name,rating,user_ratings_total,formatted_address,formatted_phone_number,opening_hours,website,price_level,photos,reviews,types,vicinity,utc_offset`
  
  const detailsResponse = await fetch(detailsUrl)
  const detailsData = await detailsResponse.json()
  
  if (detailsData.status !== 'OK') {
    throw new Error('Could not get restaurant details')
  }
  
  return detailsData
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Processing URL:', url)

    // 1. Expand the shortened URL if needed
    const expandedUrl = url.includes('goo.gl') || url.includes('maps.app') ? await expandUrl(url) : url
    console.log('Working with expanded URL:', expandedUrl)

    // 2. Extract coordinates from the URL
    const coords = extractCoordinates(expandedUrl)
    console.log('Successfully extracted coordinates:', coords)

    // 3. Find restaurant at these coordinates
    const placeDetails = await findRestaurantFromCoordinates(coords.lat, coords.lng)
    console.log('Successfully retrieved place details')

    return new Response(
      JSON.stringify(placeDetails),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})