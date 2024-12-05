const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

export async function searchRestaurant(url?: string, placeId?: string): Promise<any> {
  console.log('🔍 Starting restaurant search with:', { url, placeId });
  
  if (!GOOGLE_API_KEY) {
    throw new Error('Google Places API key is not configured');
  }

  try {
    // If placeId is provided, use it directly
    if (placeId) {
      console.log('🎯 Using provided place ID:', placeId);
      return await getPlaceDetails(placeId);
    }

    if (!url) {
      throw new Error('Either URL or placeId must be provided');
    }

    // Handle shortened URLs first
    let finalUrl = url;
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      console.log('📎 Expanding shortened URL:', url);
      try {
        const response = await fetch(url, { redirect: 'follow' });
        finalUrl = response.url;
        console.log('📎 Expanded URL:', finalUrl);
      } catch (error) {
        console.error('❌ Error expanding URL:', error);
        throw new Error('Failed to expand shortened URL');
      }
    }

    // Try to extract place ID from URL first
    const urlObj = new URL(finalUrl);
    const searchParams = new URLSearchParams(urlObj.search);
    const extractedPlaceId = searchParams.get('place_id') || 
                            finalUrl.match(/place\/[^/]+\/([^/?]+)/)?.[1];

    if (extractedPlaceId?.startsWith('ChIJ')) {
      console.log('🎯 Found place ID in URL:', extractedPlaceId);
      return await getPlaceDetails(extractedPlaceId);
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
    const data = await response.json();
    
    if (data.status === 'ZERO_RESULTS') {
      console.log('⚠️ No results from text search, trying nearby search');
      const coords = extractCoordinates(finalUrl);
      if (coords) {
        return await searchNearby(coords.lat, coords.lng);
      }
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

    // Use the first non-empty value or fallback to the URL path
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

function extractCoordinates(url: string): { lat: number; lng: number } | null {
  // Try to match coordinates in different formats
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
  }
  return null;
}

async function searchNearby(lat: number, lng: number): Promise<any> {
  console.log('🌍 Performing nearby search at coordinates:', { lat, lng });
  
  const nearbyUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  nearbyUrl.searchParams.set('key', GOOGLE_API_KEY);
  nearbyUrl.searchParams.set('location', `${lat},${lng}`);
  nearbyUrl.searchParams.set('radius', '100');
  nearbyUrl.searchParams.set('type', 'restaurant');

  const response = await fetch(nearbyUrl.toString());
  const data = await response.json();

  if (data.status !== 'OK' || !data.results?.[0]) {
    throw new Error('No restaurants found at this location');
  }

  console.log('✅ Found restaurant via nearby search');
  return await getPlaceDetails(data.results[0].place_id);
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
  
  const response = await fetch(detailsUrl.toString());
  const data = await response.json();
  
  if (data.status !== 'OK') {
    console.error('❌ Place Details API error:', data);
    throw new Error(`Place Details API error: ${data.status}`);
  }
  
  console.log('✅ Successfully retrieved place details');
  return data;
}