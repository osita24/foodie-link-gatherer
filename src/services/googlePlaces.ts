import { RestaurantDetails } from "@/types/restaurant";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com';

const extractPlaceId = (input: string): string => {
  console.log('Attempting to extract Place ID from:', input);
  
  try {
    // If it's already a place ID, just return it
    if (input.startsWith('ChIJ') || input.startsWith('0x')) {
      console.log('Input is already a Place ID');
      return input;
    }

    // Try to parse as URL
    const url = new URL(input);
    const urlParams = new URLSearchParams(url.search);
    
    // Check for place_id in URL parameters
    const placeParam = urlParams.get('place_id');
    if (placeParam) {
      console.log('Found Place ID in URL parameters:', placeParam);
      return placeParam;
    }

    // Look for hex format ID
    const fullUrl = decodeURIComponent(url.toString());
    const hexMatch = fullUrl.match(/!1s(0x[a-fA-F0-9]+:[a-fA-F0-9]+)/);
    if (hexMatch && hexMatch[1]) {
      console.log('Found hex format Place ID:', hexMatch[1]);
      return hexMatch[1];
    }

    // Look for ChIJ format ID
    const chijMatch = fullUrl.match(/!1s(ChIJ[^!]+)/);
    if (chijMatch && chijMatch[1]) {
      console.log('Found ChIJ format Place ID:', chijMatch[1]);
      return chijMatch[1];
    }

    throw new Error('Could not extract Place ID from URL');
  } catch (error) {
    console.error('Error extracting Place ID:', error);
    throw error;
  }
};

export const fetchRestaurantDetails = async (inputId: string): Promise<RestaurantDetails> => {
  console.log('Input ID/URL:', inputId);
  
  try {
    const placeId = extractPlaceId(inputId);
    console.log('Extracted Place ID:', placeId);

    if (!GOOGLE_API_KEY) {
      console.error('Google Places API key not found');
      throw new Error('Google Places API key not configured');
    }

    const baseUrl = `${CORS_PROXY}/https://maps.googleapis.com/maps/api/place`;
    
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
    
    // Properly encode the place_id parameter
    const encodedPlaceId = encodeURIComponent(placeId);
    const apiUrl = `${baseUrl}/details/json?place_id=${encodedPlaceId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
    console.log('Final API URL:', apiUrl);
    
    const response = await fetch(apiUrl);

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