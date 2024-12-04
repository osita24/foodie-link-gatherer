import { RestaurantDetails } from "@/types/restaurant";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com';

// Sample data for development and testing
const SAMPLE_RESTAURANT: RestaurantDetails = {
  id: 'sample-id',
  name: 'Sample Restaurant',
  rating: 4.5,
  reviews: 123,
  address: '123 Sample Street, Sample City',
  hours: 'Monday: 9:00 AM - 10:00 PM',
  phone: '(555) 123-4567',
  website: 'https://example.com',
  photos: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0'
  ],
  priceLevel: 2
};

export const fetchRestaurantDetails = async (placeId: string): Promise<RestaurantDetails> => {
  console.log('Fetching restaurant details for:', placeId);
  
  // Return sample data if using the sample-id
  if (placeId === 'sample-id') {
    console.log('Using sample data for development');
    return SAMPLE_RESTAURANT;
  }

  if (!GOOGLE_API_KEY) {
    console.error('Google Places API key not found');
    throw new Error('Google Places API key not configured');
  }

  // Validate Place ID format
  const placeIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!placeIdRegex.test(placeId)) {
    console.error('Invalid Place ID format:', placeId);
    throw new Error('Invalid Google Place ID format');
  }

  try {
    const baseUrl = `${CORS_PROXY}/https://maps.googleapis.com/maps/api/place`;
    
    console.log('Fetching from Google Places API...');
    const response = await fetch(
      `${baseUrl}/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,formatted_phone_number,opening_hours,website,price_level,photos&key=${GOOGLE_API_KEY}`
    );

    if (response.status === 403) {
      console.error('CORS Proxy access denied');
      throw new Error(
        'CORS Proxy access required. Please visit https://cors-anywhere.herokuapp.com/corsdemo ' +
        'and click "Request temporary access to the demo server" first.'
      );
    }

    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      throw new Error(`Failed to fetch restaurant details: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received restaurant data:', data);

    if (data.status === 'INVALID_REQUEST' || data.status === 'NOT_FOUND') {
      console.error('Google Places API error:', data.status);
      throw new Error(`Google Places API error: ${data.status}`);
    }

    if (!data.result) {
      console.error('No result found in API response');
      throw new Error('No restaurant data found');
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