import { PlacesSearchResponse } from './types.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

export async function searchRestaurant(url: string): Promise<any> {
  console.log('🔍 Starting restaurant search from URL:', url);
  
  if (!GOOGLE_API_KEY) {
    throw new Error('Google Places API key is not configured');
  }

  try {
    // Extract search text from URL
    const searchText = extractSearchText(url);
    console.log('📝 Search text extracted:', searchText);

    // Search using Places API
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('query', searchText);
    
    console.log('🌐 Fetching from Places API with search:', searchText);
    const response = await fetch(searchUrl.toString());
    const data: PlacesSearchResponse = await response.json();
    
    if (data.status !== 'OK') {
      console.error('❌ Places API error:', data);
      throw new Error(data.error_message || `Places API error: ${data.status}`);
    }
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No places found matching the search criteria');
    }
    
    // Get details for the first (best) result
    return await getPlaceDetails(data.results[0].place_id);
  } catch (error) {
    console.error('❌ Error in searchRestaurant:', error);
    throw error;
  }
}

function extractSearchText(url: string): string {
  console.log('📑 Extracting search text from URL');
  
  try {
    const urlObj = new URL(url);
    
    // Try different possible parameters where the restaurant info might be
    const searchParams = [
      urlObj.searchParams.get('q'),
      urlObj.searchParams.get('query'),
      urlObj.pathname.split('/').filter(Boolean).join(' ')
    ].filter(Boolean);

    const searchText = searchParams[0] || url;
    console.log('📝 Extracted search text:', searchText);
    return searchText;
  } catch (error) {
    console.log('⚠️ Error parsing URL, using full URL as search text');
    return url;
  }
}

async function getPlaceDetails(placeId: string): Promise<any> {
  console.log('🔍 Getting place details for ID:', placeId);
  
  const fields = [
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
    'place_id'
  ].join(',');

  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  detailsUrl.searchParams.set('place_id', placeId);
  detailsUrl.searchParams.set('fields', fields);
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY);
  
  try {
    const response = await fetch(detailsUrl.toString());
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('❌ Place Details API error:', data);
      throw new Error(`Place Details API error: ${data.status}`);
    }
    
    console.log('✨ Successfully fetched place details');
    return data;
  } catch (error) {
    console.error('❌ Error in getPlaceDetails:', error);
    throw error;
  }
}