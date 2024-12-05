import { PlacesSearchResponse } from './types.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

export async function searchRestaurant(url: string): Promise<any> {
  console.log('🔍 Starting restaurant search from URL:', url);
  
  if (!GOOGLE_API_KEY) {
    throw new Error('Google Places API key is not configured');
  }

  try {
    // First expand the URL if it's shortened
    let fullUrl = url;
    if (url.includes('goo.gl')) {
      console.log('📎 Expanding shortened URL...');
      const response = await fetch(url, { redirect: 'follow' });
      fullUrl = response.url;
      console.log('📎 Expanded URL:', fullUrl);
    }

    // Extract search text from URL
    const searchText = extractSearchText(fullUrl);
    console.log('📝 Search text extracted:', searchText);

    // Search using Places API
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('query', searchText);
    
    console.log('🌐 Making request to Places API with URL:', searchUrl.toString());
    const response = await fetch(searchUrl.toString());
    const data: PlacesSearchResponse = await response.json();
    
    console.log('📊 Places API response:', data);
    console.log('📊 Places API response status:', data.status);
    console.log('📊 Number of results:', data.results?.length || 0);
    
    if (data.status !== 'OK') {
      console.error('❌ Places API error:', data);
      throw new Error(data.error_message || `Places API error: ${data.status}`);
    }
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No places found matching the search criteria');
    }
    
    // Get details for the first (best) result
    console.log('🔍 Getting details for place_id:', data.results[0].place_id);
    const details = await getPlaceDetails(data.results[0].place_id);
    console.log('✅ Successfully retrieved place details:', details);
    return details;
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
      decodeURIComponent(urlObj.pathname).split('/').filter(Boolean).join(' ')
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
    'place_id'
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