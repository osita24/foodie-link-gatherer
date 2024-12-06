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
  detailsUrl.searchParams.set('maxheight', '1600'); // Get higher quality photos
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

  // If photos exist, get ALL photo URLs
  if (data.result.photos) {
    console.log(`📸 Found ${data.result.photos.length} photos to process`);
    const photoUrls = await Promise.all(
      data.result.photos.map(async (photo: any) => {
        const photoUrl = new URL('https://maps.googleapis.com/maps/api/place/photo');
        photoUrl.searchParams.set('maxwidth', '1600');
        photoUrl.searchParams.set('photo_reference', photo.photo_reference);
        photoUrl.searchParams.set('key', Deno.env.get('GOOGLE_PLACES_API_KEY') || '');
        
        // Get the actual photo URL by following redirects
        const photoResponse = await fetch(photoUrl.toString());
        return photoResponse.url;
      })
    );
    
    console.log(`✅ Successfully retrieved ${photoUrls.length} photo URLs`);
    data.result.photos = photoUrls;
  }
  
  console.log('✅ Successfully retrieved place details');
  return data;
}