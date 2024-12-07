import { identifyMenuPhotos } from "./utils/photoUtils.ts";

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

export async function searchRestaurant(url?: string, placeId?: string): Promise<any> {
  console.log('🔍 Starting restaurant search with:', { url, placeId });
  
  if (!GOOGLE_API_KEY) {
    console.error('❌ Google Places API key is missing');
    throw new Error('Google Places API key is not configured');
  }

  try {
    // If placeId is provided, use it directly
    if (placeId) {
      console.log('🎯 Using provided place ID:', placeId);
      return await getPlaceDetails(placeId);
    }

    if (!url) {
      throw new Error('No URL or place ID provided');
    }

    // Handle shortened URLs first
    let finalUrl = url;
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      console.log('📎 Expanding shortened URL:', url);
      try {
        const response = await fetch(url, { 
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to expand URL: ${response.status}`);
        }
        finalUrl = response.url;
        console.log('📎 Expanded URL:', finalUrl);
      } catch (error) {
        console.error('❌ Error expanding shortened URL:', error);
        throw new Error('Failed to process shortened URL');
      }
    }

    // Try to extract place ID from URL first
    try {
      const urlObj = new URL(finalUrl);
      const searchParams = new URLSearchParams(urlObj.search);
      const extractedPlaceId = searchParams.get('place_id') || 
                              finalUrl.match(/place\/[^/]+\/([^/?]+)/)?.[1];

      if (extractedPlaceId?.startsWith('ChIJ')) {
        console.log('🎯 Found place ID in URL:', extractedPlaceId);
        return await getPlaceDetails(extractedPlaceId);
      }
    } catch (error) {
      console.log('⚠️ Could not extract place ID from URL, trying text search');
    }

    // Extract search text and try text search
    const searchText = extractSearchText(finalUrl);
    console.log('🔍 Searching with text:', searchText);

    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('query', searchText);
    searchUrl.searchParams.set('type', 'restaurant');
    
    console.log('🌐 Making text search request');
    const response = await fetch(searchUrl.toString());
    if (!response.ok) {
      console.error('❌ Places API request failed:', response.status);
      throw new Error(`Places API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 Search response status:', data.status);
    
    if (data.status === 'ZERO_RESULTS') {
      throw new Error('No restaurant found at this location');
    }
    
    if (data.status !== 'OK' || !data.results?.[0]) {
      console.error('❌ Places API error:', data);
      throw new Error(`Places API error: ${data.status}`);
    }
    
    const foundPlaceId = data.results[0].place_id;
    console.log('✅ Found place ID:', foundPlaceId);
    return await getPlaceDetails(foundPlaceId);

  } catch (error) {
    console.error('❌ Error in searchRestaurant:', error);
    throw error;
  }
}

function extractSearchText(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Try different parameters where the search text might be
    const searchParams = [
      urlObj.searchParams.get('q'),
      urlObj.searchParams.get('query'),
      decodeURIComponent(urlObj.pathname.split('/place/')[1]?.split('/')[0] || '')
        .replace(/\+/g, ' ')
    ].filter(Boolean);

    const searchText = searchParams[0] || 
                      url.split('/place/')[1]?.split('/')[0]?.replace(/\+/g, ' ') || 
                      url;

    console.log('📝 Extracted search text:', searchText);
    return searchText;
  } catch (error) {
    console.log('⚠️ Error parsing URL, using full URL as search text');
    return url;
  }
}

async function getPlaceDetails(placeId: string): Promise<any> {
  console.log('🔍 Getting place details for ID:', placeId);
  
  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  detailsUrl.searchParams.set('place_id', placeId);
  detailsUrl.searchParams.set('fields', [
    'name',
    'rating',
    'formatted_address',
    'formatted_phone_number',
    'opening_hours',
    'website',
    'price_level',
    'photos',
    'reviews',
    'types',
    'user_ratings_total',
    'utc_offset',
    'place_id',
    'vicinity'
  ].join(','));
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY);
  
  console.log('🌐 Making place details request');
  const response = await fetch(detailsUrl.toString());
  
  if (!response.ok) {
    console.error('❌ Place details request failed:', response.status);
    throw new Error(`Place details request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status !== 'OK') {
    console.error('❌ Place Details API error:', data);
    throw new Error(`Place Details API error: ${data.status}`);
  }

  console.log('✅ Successfully retrieved place details');
  return data;
}