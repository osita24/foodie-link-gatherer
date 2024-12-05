import { RestaurantDetails } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

export const extractPlaceId = async (url: string): Promise<string | null> => {
  console.log('Processing URL:', url);
  
  try {
    const { data, error } = await supabase.functions.invoke('resolve-maps-url', {
      body: { url }
    });

    if (error) {
      console.error('Error from Edge Function:', error);
      throw error;
    }

    if (!data?.placeId) {
      console.error('No place ID returned:', data);
      throw new Error('Could not extract place information');
    }

    console.log('Successfully extracted place ID:', data.placeId);
    return data.placeId;
  } catch (error) {
    console.error('Error processing URL:', error);
    throw error;
  }
};

export const fetchRestaurantDetails = async (inputId: string): Promise<RestaurantDetails> => {
  console.log('Fetching details for:', inputId);
  
  try {
    const placeId = await extractPlaceId(inputId);
    if (!placeId) {
      throw new Error('Could not determine place ID');
    }

    if (!GOOGLE_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

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

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch restaurant details: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (data.status !== 'OK' || !data.result) {
      throw new Error('No restaurant data found');
    }

    // Create photo URLs
    const photoUrls = data.result.photos?.map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
    ) || [];

    // Process hours
    let hoursText = 'Hours not available';
    if (data.result.opening_hours?.weekday_text?.length > 0) {
      hoursText = data.result.opening_hours.weekday_text.join(' | ');
    }

    return {
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
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    throw error;
  }
};