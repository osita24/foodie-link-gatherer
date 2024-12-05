import { RestaurantDetails } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";

export const fetchRestaurantDetails = async (inputId: string): Promise<RestaurantDetails> => {
  console.log('Input ID/URL:', inputId);
  
  try {
    const { data, error } = await supabase.functions.invoke('resolve-maps-url', {
      body: { url: inputId }
    });

    if (error) {
      console.error('Error calling Edge Function:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from Edge Function');
    }

    console.log('Edge Function response:', data);

    // Create photo URLs
    const photoUrls = data.photos?.map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`
    ) || [];

    // Enhanced hours handling
    let hoursText = 'Hours not available';
    if (data.opening_hours?.weekday_text?.length > 0) {
      hoursText = data.opening_hours.weekday_text.join(' | ');
    } else if (data.opening_hours?.periods) {
      const periods = data.opening_hours.periods;
      hoursText = periods.map((period: any) => {
        const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][period.open.day];
        return `${day}: ${period.open.time} - ${period.close?.time || 'Closed'}`;
      }).join(' | ');
    }

    // Transform the API response into our RestaurantDetails format
    const restaurantDetails: RestaurantDetails = {
      id: inputId,
      name: data.name,
      rating: data.rating || 0,
      reviews: data.user_ratings_total || 0,
      address: data.formatted_address || data.vicinity || 'Address Not Available',
      hours: hoursText,
      phone: data.formatted_phone_number || '',
      website: data.website || '',
      photos: photoUrls,
      priceLevel: data.price_level || 0,
      openingHours: data.opening_hours ? {
        periods: data.opening_hours.periods || [],
        weekdayText: data.opening_hours.weekday_text || [],
      } : undefined,
      vicinity: data.vicinity || '',
      types: data.types || [],
      userRatingsTotal: data.user_ratings_total || 0,
      utcOffset: data.utc_offset,
      googleReviews: data.reviews || []
    };

    console.log('Transformed restaurant details:', restaurantDetails);
    return restaurantDetails;
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    throw error;
  }
};