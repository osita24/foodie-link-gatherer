const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

export async function searchRestaurant(url?: string, placeId?: string): Promise<any> {
  console.log('🔍 Starting restaurant search with:', { url, placeId });
  
  if (!GOOGLE_API_KEY) {
    throw new Error('Google Places API key is not configured');
  }

  try {
    if (placeId) {
      // Get details directly with place ID
      return await getPlaceDetails(placeId);
    }

    if (!url) {
      throw new Error('Either URL or placeId must be provided');
    }

    // Extract search text from URL
    const searchText = extractSearchText(url);
    console.log('📝 Search text extracted:', searchText);

    // First try text search
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('query', searchText);
    
    console.log('🌐 Making request to Places API with URL:', searchUrl.toString());
    const response = await fetch(searchUrl.toString());
    const data = await response.json();
    
    console.log('📊 Places API response status:', data.status);
    console.log('📊 Number of results:', data.results?.length || 0);
    
    if (data.status === 'ZERO_RESULTS') {
      // If text search fails, try nearby search using coordinates from URL
      const coords = extractCoordinates(url);
      if (coords) {
        console.log('🌍 Trying nearby search with coordinates:', coords);
        return await searchNearby(coords.lat, coords.lng);
      }
    }
    
    if (data.status !== 'OK') {
      console.error('❌ Places API error:', data);
      throw new Error(`Places API error: ${data.status}`);
    }
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No places found matching the search criteria');
    }
    
    // Get details for the first (best) result
    console.log('🔍 Getting details for place_id:', data.results[0].place_id);
    return await getPlaceDetails(data.results[0].place_id);
  } catch (error) {
    console.error('❌ Error in searchRestaurant:', error);
    throw error;
  }
}

function extractSearchText(url: string): string {
  console.log('📑 Extracting search text from URL:', url);
  
  try {
    const urlObj = new URL(url);
    
    // Try different possible parameters where the search text might be
    const searchParams = [
      urlObj.searchParams.get('q'),
      urlObj.searchParams.get('query'),
      urlObj.pathname.split('/').filter(part => 
        part && !part.includes('@') && !part.includes(',')
      ).join(' ')
    ].filter(Boolean);

    const searchText = searchParams[0] || url;
    console.log('📝 Extracted search text:', searchText);
    return searchText;
  } catch (error) {
    console.log('⚠️ Error parsing URL, using full URL as search text');
    return url;
  }
}

function extractCoordinates(url: string): { lat: number; lng: number } | null {
  const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    return {
      lat: parseFloat(coordsMatch[1]),
      lng: parseFloat(coordsMatch[2])
    };
  }
  return null;
}

async function searchNearby(lat: number, lng: number): Promise<any> {
  const nearbyUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  nearbyUrl.searchParams.set('key', GOOGLE_API_KEY);
  nearbyUrl.searchParams.set('location', `${lat},${lng}`);
  nearbyUrl.searchParams.set('radius', '100'); // Small radius since we know exact location
  nearbyUrl.searchParams.set('type', 'restaurant');

  const response = await fetch(nearbyUrl.toString());
  const data = await response.json();

  if (data.status !== 'OK' || !data.results?.[0]) {
    throw new Error('No restaurants found at this location');
  }

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
  
  try {
    console.log('🌐 Making request to Place Details API');
    const response = await fetch(detailsUrl.toString());
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('❌ Place Details API error:', data);
      throw new Error(data.error_message || `Place Details API error: ${data.status}`);
    }
    
    console.log('✅ Successfully retrieved place details');
    return data;
  } catch (error) {
    console.error('❌ Error in getPlaceDetails:', error);
    throw error;
  }
}