import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function expandUrl(shortUrl: string): Promise<string> {
  console.log('Expanding URL:', shortUrl)
  const response = await fetch(shortUrl, {
    method: 'GET',
    redirect: 'follow'
  })
  console.log('Expanded URL:', response.url)
  return response.url
}

async function getPlaceDetails(placeId: string) {
  console.log('Fetching place details for:', placeId)
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}&fields=place_id,name,rating,user_ratings_total,formatted_address,formatted_phone_number,opening_hours,website,price_level,photos,reviews,types,vicinity,utc_offset`
  
  const response = await fetch(url)
  const data = await response.json()
  
  if (data.status !== 'OK') {
    throw new Error(`Place Details API error: ${data.status}`)
  }
  
  return data
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
    const expandedUrl = url.includes('goo.gl') ? await expandUrl(url) : url
    console.log('Working with URL:', expandedUrl)

    // 2. Extract place ID from URL
    const placeIdMatch = expandedUrl.match(/place\/(.*?)(\/|$|\?)/i)
    if (!placeIdMatch) {
      throw new Error('Could not extract place ID from URL')
    }

    const placeId = placeIdMatch[1]
    console.log('Extracted place ID:', placeId)

    // 3. Get place details
    const placeDetails = await getPlaceDetails(placeId)
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