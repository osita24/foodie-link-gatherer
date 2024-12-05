import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function expandUrl(shortUrl: string): Promise<string> {
  console.log('Expanding URL:', shortUrl)
  try {
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'follow'
    })
    console.log('Expanded URL:', response.url)
    return response.url
  } catch (error) {
    console.error('Error expanding URL:', error)
    throw new Error('Failed to expand shortened URL')
  }
}

function extractCoordinates(url: string): { lat: string, lng: string } {
  console.log('Attempting to extract coordinates from:', url)
  
  // Try different URL patterns
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/, // Standard format
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // Alternate format
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // Another format
    /center=(-?\d+\.\d+),(-?\d+\.\d+)/ // Center parameter format
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      console.log('Found coordinates:', match[1], match[2])
      return { lat: match[1], lng: match[2] }
    }
  }

  throw new Error('Could not extract coordinates from URL')
}

async function findRestaurantFromCoordinates(lat: string, lng: string) {
  console.log('Searching for restaurant at coordinates:', lat, lng)
  
  // First search for nearby restaurants with increased radius
  const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&type=restaurant&key=${GOOGLE_API_KEY}`
  
  const nearbyResponse = await fetch(nearbyUrl)
  const nearbyData = await nearbyResponse.json()
  
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