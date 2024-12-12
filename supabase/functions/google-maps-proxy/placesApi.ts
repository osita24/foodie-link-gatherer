import { cleanUrl, expandShortUrl, extractCoordinates, extractPlaceId } from './utils/urlParser';
import { isLocationNearby } from './utils/distanceCalculator';

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
      throw new Error('No URL or place ID provided');
    }

    // Handle shortened URLs
    let finalUrl = cleanUrl(url);
    if (finalUrl.includes('goo.gl') || finalUrl.includes('maps.app.goo.gl')) {
      finalUrl = await expandShortUrl(finalUrl);
    }

    // Try to extract place ID first
    const extractedPlaceId = extractPlaceId(finalUrl);
    if (extractedPlaceId) {
      return await getPlaceDetails(extractedPlaceId);
    }

    // Extract coordinates and search text
    const { lat, lng } = extractCoordinates(finalUrl);
    const result = await searchByTextAndLocation(finalUrl, lat, lng);
    
    console.log('✅ Found place ID:', result.place_id);
    return await getPlaceDetails(result.place_id);

  } catch (error) {
    console.error('❌ Error in searchRestaurant:', error);
    throw error;
  }
}

async function searchByTextAndLocation(url: string, latitude?: string, longitude?: string) {
  const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  searchUrl.searchParams.set('key', GOOGLE_API_KEY);
  searchUrl.searchParams.set('query', extractSearchText(url));
  searchUrl.searchParams.set('type', 'restaurant');
  
  if (latitude && longitude) {
    searchUrl.searchParams.set('location', `${latitude},${longitude}`);
    searchUrl.searchParams.set('radius', '1000'); // Search within 1km radius
    console.log('🎯 Adding location bias to search');
  }
  
  const response = await fetch(searchUrl.toString());
  if (!response.ok) {
    throw new Error(`Places API request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.results?.[0]) {
    throw new Error('Could not find restaurant. Please check the URL and try again.');
  }

  // Verify location accuracy if coordinates are available
  if (latitude && longitude) {
    const result = data.results[0];
    const isNearby = isLocationNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      result.geometry.location.lat,
      result.geometry.location.lng
    );
    
    if (!isNearby) {
      console.warn('⚠️ First result may be incorrect - searching for closer match');
      // Try to find a closer match in the results
      const closerMatch = data.results.find(r => 
        isLocationNearby(
          parseFloat(latitude),
          parseFloat(longitude),
          r.geometry.location.lat,
          r.geometry.location.lng
        )
      );
      
      if (closerMatch) {
        console.log('✅ Found closer matching restaurant');
        return closerMatch;
      }
    }
  }

  return data.results[0];
}

function extractSearchText(url: string): string {
  try {
    const urlObj = new URL(url);
    const searchParams = [
      urlObj.searchParams.get('q'),
      urlObj.searchParams.get('query'),
      decodeURIComponent(urlObj.pathname.split('/place/')[1]?.split('/')[0] || '')
        .replace(/\+/g, ' ')
    ].filter(Boolean);

    return searchParams[0] || url;
  } catch {
    return url;
  }
}

async function getPlaceDetails(placeId: string): Promise<any> {
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
    'vicinity',
    'geometry'
  ].join(','));
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY);
  
  const response = await fetch(detailsUrl.toString());
  if (!response.ok) {
    throw new Error(`Place details request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  if (data.status !== 'OK' || !data.result) {
    throw new Error('Restaurant details not found');
  }

  return data;
}