import { PlacesSearchResponse, LocationData } from './types.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

export async function searchRestaurant(name: string, location?: LocationData): Promise<any> {
  console.log('🔍 Searching for restaurant:', { name, location });
  
  if (!GOOGLE_API_KEY) {
    throw new Error('Google Places API key is not configured');
  }

  const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  searchUrl.searchParams.set('key', GOOGLE_API_KEY);
  
  // Build the search query
  let query = name;
  if (location?.address) {
    query += ` ${location.address}`;
  }
  searchUrl.searchParams.set('query', query);
  
  // If we have coordinates, use them to bias the search
  if (location?.lat && location?.lng) {
    searchUrl.searchParams.set('location', `${location.lat},${location.lng}`);
    searchUrl.searchParams.set('radius', '1000'); // Search within 1km of the coordinates
  }

  try {
    console.log('🌐 Fetching from Places API:', searchUrl.toString());
    const response = await fetch(searchUrl.toString());
    const data: PlacesSearchResponse = await response.json();
    
    if (data.status !== 'OK') {
      console.error('❌ Places API error:', data);
      throw new Error(data.error_message || `Places API error: ${data.status}`);
    }
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No places found matching the search criteria');
    }
    
    // Get details for the first result
    return await getPlaceDetails(data.results[0].place_id);
  } catch (error) {
    console.error('❌ Error in searchRestaurant:', error);
    throw error;
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