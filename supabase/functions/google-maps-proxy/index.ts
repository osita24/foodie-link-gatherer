import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getPlaceDetails } from "./placesApi.ts"

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
    console.log('Expanded URL:', response.url)
    return response.url
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
    
    // First try to get place_id from URL parameters
    if (searchParams.has('place_id')) {
      const placeId = searchParams.get('place_id')
      console.log('Found direct place_id:', placeId)
      return placeId
    }

    // Try to extract from ftid parameter (common in expanded URLs)
    if (searchParams.has('ftid')) {
      const ftid = searchParams.get('ftid')
      if (ftid) {
        const placeId = ftid.split(':')[1]
        console.log('Extracted Place ID from ftid:', placeId)
        return placeId
      }
    }

    console.log('No Place ID found in URL')
    return null
  } catch (error) {
    console.error('Error parsing URL:', error)
    return null
  }
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
      throw new Error('Could not extract place ID from URL')
    }

    // Get place details using the place ID
    console.log('Fetching details for place ID:', placeId)
    const placeDetails = await getPlaceDetails(placeId)
    
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