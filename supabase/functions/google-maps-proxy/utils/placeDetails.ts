import { identifyMenuPhotos } from './photoUtils.ts';

export async function getPlaceDetails(placeId: string): Promise<any> {
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
  detailsUrl.searchParams.set('key', Deno.env.get('GOOGLE_PLACES_API_KEY') || '');
  
  console.log('🌐 Making place details request');
  const response = await fetch(detailsUrl.toString());
  if (!response.ok) {
    throw new Error(`Place details request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status !== 'OK') {
    console.error('❌ Place Details API error:', data);
    throw new Error(`Place Details API error: ${data.status}`);
  }

  // If photos exist, identify potential menu photos
  if (data.result.photos) {
    const menuPhotoRefs = await identifyMenuPhotos(data.result.photos);
    data.result.menuPhotos = menuPhotoRefs;
  }
  
  console.log('✅ Successfully retrieved place details');
  return data;
}