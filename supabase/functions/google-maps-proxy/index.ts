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
      method: 'GET',
      redirect: 'follow',
    })
    const expandedUrl = response.url
    console.log('🔍 EXPANDED URL:', expandedUrl)  // Added this log
    return expandedUrl
  } catch (error) {
    console.error('Error expanding URL:', error)
    throw new Error('Failed to expand shortened URL')
  }
}

function extractPlaceId(url: string): string | null {
  console.log('Attempting to extract Place ID from URL:', url)
  try {
    const urlObj = new URL(url)
    const searchParams = new URLSearchParams(urlObj.search)
    
    // Check for place_id in URL parameters
    if (searchParams.has('place_id')) {
      const placeId = searchParams.get('place_id')
      console.log('Found place_id in URL parameters:', placeId)
      return placeId
    }

    // Check for ftid parameter (common in expanded URLs)
    if (searchParams.has('ftid')) {
      const ftid = searchParams.get('ftid')
      if (ftid) {
        const placeId = ftid.split(':')[1]
        console.log('Extracted Place ID from ftid:', placeId)
        return placeId
      }
    }

    // Try to extract from the URL path for newer format URLs
    const pathMatch = url.match(/place\/[^/]+\/([^/]+)/);
    if (pathMatch && pathMatch[1]) {
      const placeId = pathMatch[1];
      if (placeId.startsWith('ChIJ')) {
        console.log('Extracted Place ID from path:', placeId);
        return placeId;
      }
    }

    // Extract from the data parameter for older format URLs
    const dataParam = searchParams.get('data');
    if (dataParam) {
      const placeIdMatch = dataParam.match(/!1s(ChIJ[^!]+)!/);
      if (placeIdMatch && placeIdMatch[1]) {
        console.log('Extracted Place ID from data parameter:', placeIdMatch[1]);
        return placeIdMatch[1];
      }
    }

    console.log('No Place ID found in URL')
    return null
  } catch (error) {
    console.error('Error parsing URL:', error)
    return null
  }
}

async function getPlaceDetails(placeId: string) {
  console.log('Fetching details for place:', placeId)
  
  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  detailsUrl.searchParams.set('place_id', placeId)
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY!)
  detailsUrl.searchParams.set('fields', [
    'place_id',
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

  const response = await fetch(detailsUrl.toString())
  
  if (!response.ok) {
    console.error('Place Details API error:', await response.text())
    throw new Error('Failed to fetch place details')
  }

  const data = await response.json()
  
  if (data.status !== 'OK') {
    throw new Error(`Places API error: ${data.status}`)
  }

  return data
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Original URL received:', url)

    // Expand the URL if it's shortened
    const expandedUrl = url.includes('goo.gl') || url.includes('maps.app.goo.gl') ? 
      await expandUrl(url) : url
    console.log('Working with URL:', expandedUrl)

    // Try to extract place ID from the expanded URL
    const placeId = extractPlaceId(expandedUrl)
    if (!placeId) {
      console.error('Could not extract place ID from URL:', expandedUrl)
      throw new Error('Could not extract place ID from URL')
    }

    console.log('Successfully extracted place ID:', placeId)

    // Get place details using the place ID
    const placeDetails = await getPlaceDetails(placeId)
    console.log('Successfully fetched place details')
    
    return new Response(
      JSON.stringify(placeDetails),
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