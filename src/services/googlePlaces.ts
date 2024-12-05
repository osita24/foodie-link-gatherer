import { RestaurantDetails } from "@/types/restaurant";
import { parseGoogleMapsUrl } from "@/utils/googleMapsUrlParser";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

/**
 * Fetches place details from coordinates using Google Places API
 */
const fetchPlaceFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  console.log('Fetching place from coordinates:', { lat, lng });
  
  const baseUrl = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  const response = await fetch(
    `${baseUrl}?location=${lat},${lng}&rankby=distance&key=${GOOGLE_API_KEY}`,
    {
      headers: {
        'Origin': window.location.origin
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch place from coordinates');
  }

  const data = await response.json();
  if (data.results && data.results[0]) {
    return data.results[0].place_id;
  }

  throw new Error('No places found at these coordinates');
};

export const fetchRestaurantDetails = async (inputUrl: string): Promise<RestaurantDetails> => {
  console.log('Starting restaurant details fetch for:', inputUrl);
  
  if (!GOOGLE_API_KEY) {
    console.error('Google Places API key not found');
    throw new Error('Google Places API key not configured');
  }

  try {
    // Parse the input URL
    const parsedUrl = await parseGoogleMapsUrl(inputUrl);
    console.log('Parsed URL result:', parsedUrl);

    // Get the place ID either directly or from coordinates
    let placeId: string;
    
    if (parsedUrl.type === 'place_id' && parsedUrl.placeId) {
      placeId = parsedUrl.placeId;
    } else if (parsedUrl.type === 'coordinates' && parsedUrl.coordinates) {
      placeId = await fetchPlaceFromCoordinates(
        parsedUrl.coordinates.lat,
        parsedUrl.coordinates.lng
      );
    } else {
      throw new Error('Could not extract location information from URL');
    }

    console.log('Using Place ID:', placeId);

    // Use CORS proxy for development
    const baseUrl = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place';
    
    // Request all necessary fields
    const fields = [
      'name',
      'rating',
      'user_ratings_total',
      'formatted_address',
      'formatted_phone_number',
      'opening_hours',
      'website',
      'price_level',
      'photos',
      'reviews',
      'types',
      'vicinity',
      'utc_offset'
    ].join(',');

    console.log('Making API request for fields:', fields);
    
    const response = await fetch(
      `${baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`,
      {
        headers: {
          'Origin': window.location.origin
        }
      }
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
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch restaurant details: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API response:', data);

    if (data.status === 'INVALID_REQUEST' || data.status === 'NOT_FOUND') {
      console.error('Google Places API error:', data.status);
      throw new Error(`Google Places API error: ${data.status}`);
    }

    if (!data.result) {
      console.error('No result found in API response');
      throw new Error('No restaurant data found');
    }

    // Create photo URLs
    const photoUrls = data.result.photos?.map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
    ) || [];

    // Enhanced hours handling
    let hoursText = 'Hours not available';
    if (data.result.opening_hours?.weekday_text?.length > 0) {
      hoursText = data.result.opening_hours.weekday_text.join(' | ');
    } else if (data.result.opening_hours?.periods) {
      const periods = data.result.opening_hours.periods;
      hoursText = periods.map((period: any) => {
        const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][period.open.day];
        return `${day}: ${period.open.time} - ${period.close?.time || 'Closed'}`;
      }).join(' | ');
    }

    // Transform the API response into our RestaurantDetails format
    const restaurantDetails: RestaurantDetails = {
      id: placeId,
      name: data.result.name,
      rating: data.result.rating || 0,
      reviews: data.result.user_ratings_total || 0,
      address: data.result.formatted_address || data.result.vicinity || 'Address Not Available',
      hours: hoursText,
      phone: data.result.formatted_phone_number || '',
      website: data.result.website || '',
      photos: photoUrls,
      priceLevel: data.result.price_level || 0,
      openingHours: data.result.opening_hours ? {
        periods: data.result.opening_hours.periods || [],
        weekdayText: data.result.opening_hours.weekday_text || [],
      } : undefined,
      vicinity: data.result.vicinity || '',
      types: data.result.types || [],
      userRatingsTotal: data.result.user_ratings_total || 0,
      utcOffset: data.result.utc_offset,
      googleReviews: data.result.reviews || []
    };

    console.log('Transformed restaurant details:', restaurantDetails);
    return restaurantDetails;
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    throw error;
  }
};