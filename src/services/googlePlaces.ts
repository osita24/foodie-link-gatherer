import { RestaurantDetails } from "@/types/restaurant";
import { parseGoogleMapsUrl } from "@/utils/googleMapsUrlParser";
import { supabase } from "@/integrations/supabase/client";

const makeProxyRequest = async (endpoint: string, params: Record<string, string>) => {
  console.log('Making proxy request for endpoint:', endpoint, 'with params:', params);
  
  const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
    body: { endpoint, params }
  });

  if (error) {
    console.error('Proxy request failed:', error);
    throw new Error(`Proxy request failed: ${error.message}`);
  }

  console.log('Proxy response:', data);
  return data;
};

/**
 * Fetches place details from coordinates using Google Places API
 */
const fetchPlaceFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  console.log('Fetching place from coordinates:', { lat, lng });
  
  const data = await makeProxyRequest('nearbysearch/json', {
    location: `${lat},${lng}`,
    rankby: 'distance'
  });

  if (data.results && data.results[0]) {
    return data.results[0].place_id;
  }

  throw new Error('No places found at these coordinates');
};

export const fetchRestaurantDetails = async (inputUrl: string): Promise<RestaurantDetails> => {
  console.log('Starting restaurant details fetch for:', inputUrl);

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
    
    const data = await makeProxyRequest('details/json', {
      place_id: placeId,
      fields
    });

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