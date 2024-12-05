import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

async function resolveUrl(url: string): Promise<string> {
  console.log('Attempting to resolve URL:', url)
  
  // Check if the input is already a Place ID
  if (url.startsWith('ChIJ')) {
    console.log('Input appears to be a Place ID, returning as is:', url)
    return url
  }

  try {
    // Add protocol if missing
    if (!url.startsWith('http')) {
      url = 'https://' + url
    }

    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('URL resolution failed:', response.status, response.statusText)
      throw new Error(`Failed to resolve URL: ${response.status} ${response.statusText}`)
    }

    console.log('Resolved to:', response.url)
    return response.url
  } catch (error) {
    console.error('Error resolving URL:', error)
    throw error
  }
}

async function searchPlace(query: string): Promise<string | null> {
  console.log('Searching for place:', query)
  
  if (!GOOGLE_API_KEY) {
    throw new Error('Google Places API key not configured')
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_API_KEY}`
    )
    
    if (!response.ok) {
      console.error('Place search failed:', response.status, response.statusText)
      throw new Error(`Failed to search place: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Search response:', data)
    
    if (data.status === 'OK' && data.candidates?.length > 0) {
      return data.candidates[0].place_id
    }
    
    console.error('No place found in search results:', data)
    return null
  } catch (error) {
    console.error('Error searching place:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Processing URL:', url)

    if (!url) {
      throw new Error('No URL provided')
    }

    // If the input is already a Place ID, use it directly
    if (url.startsWith('ChIJ')) {
      console.log('Input is already a Place ID:', url)
      return new Response(
        JSON.stringify({ placeId: url }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      )
    }

    // First resolve the URL if it's shortened
    const resolvedUrl = await resolveUrl(url)
    console.log('Resolved URL:', resolvedUrl)

    // Extract search query from URL
    const urlObj = new URL(resolvedUrl)
    const searchParams = new URLSearchParams(urlObj.search)
    const query = searchParams.get('q') || 
                 urlObj.pathname.split('/').filter(Boolean).pop() || 
                 ''

    if (!query) {
      throw new Error('Could not extract search query')
    }

    console.log('Extracted query:', query)
    
    // Search for the place using the query
    const placeId = await searchPlace(query)
    
    if (!placeId) {
      throw new Error('Could not find place')
    }

    return new Response(
      JSON.stringify({ 
        resolvedUrl,
        placeId
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})