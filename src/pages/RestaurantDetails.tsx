import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import { RestaurantDetails as RestaurantDetailsType } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";
import RestaurantHero from "@/components/restaurant/layout/RestaurantHero";
import MainContent from "@/components/restaurant/layout/MainContent";
import Sidebar from "@/components/restaurant/layout/Sidebar";
import MatchScoreCard from "@/components/restaurant/MatchScoreCard";
import OrderSection from "@/components/restaurant/OrderSection";

// Define match categories
const matchCategories = [
  {
    category: "Menu Match",
    score: 92,
    description: "Based on your favorite ingredients and dietary preferences",
    icon: "🍽️"
  },
  {
    category: "Cuisine Style",
    score: 88,
    description: "Aligns with your preferred cooking styles and flavors",
    icon: "👨‍🍳"
  },
  {
    category: "Price Point",
    score: 85,
    description: "Matches your typical dining budget",
    icon: "💰"
  },
  {
    category: "Atmosphere",
    score: 90,
    description: "Fits your preferred dining environment",
    icon: "✨"
  }
];

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
        console.log("Fetching details for restaurant ID:", id);
        const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
          body: { placeId: id }
        });

        if (error) throw error;

        if (!data?.result?.result) {
          throw new Error("No restaurant data found");
        }

        const restaurantData = data.result.result;
        console.log("Received restaurant data:", restaurantData);

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

        setRestaurant(transformedData);
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        toast.error("Failed to load restaurant details");
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id, navigate]);

  if (isLoading) {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-up">
      <Header />
      <RestaurantHero photoUrl={restaurant?.photos?.[0]} />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <MainContent restaurant={restaurant} />
          
          <div className="block lg:hidden space-y-6">
            <MatchScoreCard categories={matchCategories} />
            <OrderSection />
          </div>
          
          <Sidebar matchCategories={matchCategories} />
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;