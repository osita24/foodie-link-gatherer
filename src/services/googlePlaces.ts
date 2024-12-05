import { RestaurantDetails } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";

export const fetchRestaurantDetails = async (inputUrl: string): Promise<RestaurantDetails> => {
  console.log('🔍 Starting restaurant details fetch for:', inputUrl);

  try {
    console.log('🌐 Calling Edge Function with URL:', inputUrl);
    const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
      body: { url: inputUrl }
    });

    if (error) {
      console.error('❌ Error from Edge Function:', error);
      throw new Error(error.message || 'Failed to fetch restaurant details');
    }

    if (!data || !data.result) {
      console.error('❌ No result found in API response:', data);
      throw new Error('No restaurant data found');
    }

    console.log('✅ Received data from Edge Function:', data);

    // Create photo URLs
    const photoUrls = data.result.photos?.map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`
    ) || [];

    // Transform the API response into our RestaurantDetails format
    const restaurantDetails: RestaurantDetails = {
      id: data.result.place_id,
      name: data.result.name,
      rating: data.result.rating || 0,
      reviews: data.result.user_ratings_total || 0,
      address: data.result.formatted_address || data.result.vicinity || 'Address Not Available',
      hours: data.result.opening_hours?.weekday_text?.join(' | ') || 'Hours not available',
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

    console.log('✅ Successfully transformed restaurant details:', restaurantDetails);
    return restaurantDetails;
  } catch (error) {
    console.error('❌ Error fetching restaurant details:', error);
    throw error;
  }
};