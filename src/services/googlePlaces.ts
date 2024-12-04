import { RestaurantDetails } from "@/types/restaurant";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com';

export const fetchRestaurantDetails = async (placeId: string): Promise<RestaurantDetails> => {
  console.log('Fetching restaurant details for:', placeId);
  
  if (!GOOGLE_API_KEY) {
    console.error('Google Places API key not found');
    throw new Error('Google Places API key not configured');
  }

  try {
    const baseUrl = `${CORS_PROXY}/https://maps.googleapis.com/maps/api/place`;
    
    const response = await fetch(
      `${baseUrl}/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,formatted_phone_number,opening_hours,website,price_level,photos&key=${GOOGLE_API_KEY}`
    );

    if (response.status === 403) {
      throw new Error(
        'CORS Proxy access required. Please visit https://cors-anywhere.herokuapp.com/corsdemo ' +
        'and click "Request temporary access to the demo server" first.'
      );
    }

    if (!response.ok) {
      throw new Error('Failed to fetch restaurant details');
    }

    const data = await response.json();
    console.log('Received restaurant data:', data);

    if (data.status === 'INVALID_REQUEST' || data.status === 'NOT_FOUND') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return {
      id: placeId,
      name: data.result.name || 'Restaurant Name Not Available',
      rating: data.result.rating || 0,
      reviews: data.result.user_ratings_total || 0,
      address: data.result.formatted_address || 'Address Not Available',
      hours: data.result.opening_hours?.weekday_text?.[0] || 'Hours not available',
      phone: data.result.formatted_phone_number || 'Phone Not Available',
      website: data.result.website || '',
      photos: data.result.photos?.map((photo: any) => 
        `${baseUrl}/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
      ) || [],
      priceLevel: data.result.price_level || 0
    };
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    throw error;
  }
};