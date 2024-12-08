import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import RestaurantInfo from "@/components/restaurant/RestaurantInfo";
import MenuSection from "@/components/restaurant/MenuSection";
import PhotosSection from "@/components/restaurant/PhotosSection";
import ReviewsSection from "@/components/restaurant/ReviewsSection";
import ActionButtons from "@/components/restaurant/ActionButtons";
import OrderSection from "@/components/restaurant/OrderSection";
import AdditionalInfo from "@/components/restaurant/AdditionalInfo";
import RestaurantSummary from "@/components/restaurant/RestaurantSummary";
import { RestaurantDetails as RestaurantDetailsType } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";

const RestaurantDetails = () => {
  const [restaurant, setRestaurant] = useState<RestaurantDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (!id) {
        console.error("No restaurant ID provided");
        toast.error("Restaurant not found");
        navigate('/');
        return;
      }

      try {
        console.log("🔍 Starting fetch for restaurant ID:", id);
        setIsLoading(true);
        
        const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
          body: { placeId: id }
        });

        console.log("📡 Response received:", data);

        if (error) {
          console.error("❌ Error from Edge Function:", error);
          throw error;
        }

        if (!data?.result?.result) {
          console.error("❌ No result found in API response:", data);
          throw new Error("No restaurant data found");
        }

        const restaurantData = data.result.result;
        console.log("✨ Processing restaurant data:", restaurantData);

        // Transform the data to match our type
        const transformedData: RestaurantDetailsType = {
          id: restaurantData.place_id,
          name: restaurantData.name,
          rating: restaurantData.rating || 0,
          reviews: restaurantData.user_ratings_total || 0,
          address: restaurantData.formatted_address || restaurantData.vicinity || 'Address Not Available',
          hours: restaurantData.opening_hours?.weekday_text?.join(' | ') || 'Hours not available',
          phone: restaurantData.formatted_phone_number || '',
          website: restaurantData.website || '',
          photos: restaurantData.photos?.map((photo: any) => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`
          ) || [],
          priceLevel: restaurantData.price_level || 0,
          openingHours: restaurantData.opening_hours ? {
            periods: restaurantData.opening_hours.periods || [],
            weekdayText: restaurantData.opening_hours.weekday_text || [],
          } : undefined,
          vicinity: restaurantData.vicinity || '',
          types: restaurantData.types || [],
          userRatingsTotal: restaurantData.user_ratings_total || 0,
          utcOffset: restaurantData.utc_offset,
          googleReviews: restaurantData.reviews || [],
          businessStatus: restaurantData.business_status,
          curbsidePickup: restaurantData.curbside_pickup,
          delivery: restaurantData.delivery,
          dineIn: restaurantData.dine_in,
          priceRange: restaurantData.price_range,
          reservable: restaurantData.reservable,
          servesBeer: restaurantData.serves_beer,
          servesBreakfast: restaurantData.serves_breakfast,
          servesBrunch: restaurantData.serves_brunch,
          servesLunch: restaurantData.serves_lunch,
          servesDinner: restaurantData.serves_dinner,
          servesVegetarianFood: restaurantData.serves_vegetarian_food,
          servesWine: restaurantData.serves_wine,
          takeout: restaurantData.takeout,
          wheelchairAccessible: restaurantData.wheelchair_accessible_entrance,
        };

        console.log("✅ Setting restaurant data:", transformedData);
        setRestaurant(transformedData);
      } catch (error) {
        console.error("❌ Error fetching restaurant details:", error);
        toast.error("Failed to load restaurant details");
        navigate('/');
      } finally {
        console.log("🏁 Finishing loading state");
        setIsLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id, navigate]);

  if (isLoading) {
    console.log("🔄 Rendering loading state");
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="animate-fade-up space-y-4 p-4">
          <div className="w-full h-[40vh] bg-gray-200 animate-pulse rounded-lg" />
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                  <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    console.log("⚠️ No restaurant data available");
    return null;
  }

  console.log("🎉 Rendering restaurant details:", restaurant.name);
  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-up">
      <Header />
      <div className="w-full h-[30vh] sm:h-[40vh] md:h-[50vh] relative">
        <img 
          src={restaurant?.photos?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
          alt="Restaurant hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <ActionButtons />
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <RestaurantInfo restaurant={restaurant} />
            </div>
            
            <RestaurantSummary restaurant={restaurant} />
            
            <MenuSection 
              menu={restaurant?.menu} 
              photos={restaurant?.photos}
              reviews={restaurant?.googleReviews}
              menuUrl={restaurant?.website}
            />

            <div className="block lg:hidden">
              <OrderSection />
            </div>

            <AdditionalInfo restaurant={restaurant} />
            {restaurant?.photos && <PhotosSection photos={restaurant.photos} />}
            {restaurant?.googleReviews && <ReviewsSection reviews={restaurant.googleReviews} />}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <OrderSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
