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
    const { endpoint, params, action, url } = await req.json()

    // Handle URL expansion
    if (action === 'expand_url') {
      console.log('Expanding URL:', url)
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to expand URL')
      }

      const expandedUrl = response.url
      console.log('Expanded URL:', expandedUrl)
      
      // Extract query parameter
      const urlObj = new URL(expandedUrl);
      const query = urlObj.searchParams.get('q');
      
      if (!query) {
        throw new Error('No restaurant query found in URL');
      }

      // Use the query to search for the place
      const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      searchUrl.searchParams.set('query', query);
      searchUrl.searchParams.set('key', GOOGLE_API_KEY);
      
      console.log('Searching for place with query:', query);
      const placeResponse = await fetch(searchUrl.toString());
      const placeData = await placeResponse.json();
      
      if (!placeData.results?.[0]) {
        throw new Error('No place found');
      }
      
      // Get full place details
      const placeId = placeData.results[0].place_id;
      const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      detailsUrl.searchParams.set('place_id', placeId);
      detailsUrl.searchParams.set('key', GOOGLE_API_KEY);
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
      ].join(','));
      
      const detailsResponse = await fetch(detailsUrl.toString());
      const detailsData = await detailsResponse.json();
      
      return new Response(
        JSON.stringify(detailsData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle direct Places API requests
    const apiUrl = new URL(`https://maps.googleapis.com/maps/api/place/${endpoint}`)
    apiUrl.search = new URLSearchParams({
      ...params,
      key: GOOGLE_API_KEY,
    }).toString()

    console.log('Making request to:', apiUrl.toString())
    const response = await fetch(apiUrl)
    const data = await response.json()

    return new Response(
      JSON.stringify(data),
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