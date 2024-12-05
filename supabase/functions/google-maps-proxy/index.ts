import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function expandUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.url;
  } catch (error) {
    console.error('Error expanding URL:', error);
    throw new Error('Failed to expand URL');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, url, endpoint, params } = await req.json()

    if (action === 'expand_url') {
      const expandedUrl = await expandUrl(url);
      return new Response(
        JSON.stringify({ expandedUrl }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Handle Google Places API proxying
    if (endpoint) {
      const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
      const baseUrl = 'https://maps.googleapis.com/maps/api/place'
      
      const queryParams = new URLSearchParams({
        ...params,
        key: GOOGLE_PLACES_API_KEY || '',
      })

      const response = await fetch(
        `${baseUrl}/${endpoint}?${queryParams.toString()}`,
        { headers: { 'Content-Type': 'application/json' } }
      )

      const data = await response.json()

      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    throw new Error('Invalid request')
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})