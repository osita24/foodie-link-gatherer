import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import Header from "@/components/Header";
import RestaurantInfo from "@/components/restaurant/RestaurantInfo";
import MenuSection from "@/components/restaurant/MenuSection";
import PhotosSection from "@/components/restaurant/PhotosSection";
import ReviewsSection from "@/components/restaurant/ReviewsSection";
import ActionButtons from "@/components/restaurant/ActionButtons";
import { RestaurantDetails as RestaurantDetailsType } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";
import RestaurantSummary from "@/components/restaurant/RestaurantSummary";
import SavePrompt from "@/components/restaurant/SavePrompt";
import DirectionsButton from "@/components/restaurant/DirectionsButton";
import AmenitiesSection from "@/components/restaurant/AmenitiesSection";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import SimilarRestaurants from "@/components/restaurant/SimilarRestaurants";

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

  const getMetaDescription = (restaurant: RestaurantDetailsType | null) => {
    if (!restaurant) return "";
    return `Explore ${restaurant.name}'s menu with personalized recommendations. ${
      restaurant.cuisine ? `Featuring ${restaurant.cuisine} cuisine. ` : ""
    }${restaurant.rating ? `Rated ${restaurant.rating}/5 by diners. ` : ""}Find your perfect dish with Cilantro's AI-powered menu analysis.`;
  };

  const getMetaImage = (restaurant: RestaurantDetailsType | null) => {
    return restaurant?.photos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Loading Restaurant Details | Cilantro</title>
        </Helmet>
        <Header />
        <div className="animate-fade-up space-y-4 p-4">
          <Skeleton className="w-full h-[40vh] rounded-lg" />
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-background pb-32 animate-fade-up">
      <Helmet>
        <title>{`${restaurant.name} - Menu & Recommendations | Cilantro`}</title>
        <meta name="description" content={getMetaDescription(restaurant)} />
        <meta property="og:title" content={`${restaurant.name} - Personalized Menu Recommendations`} />
        <meta property="og:description" content={getMetaDescription(restaurant)} />
        <meta property="og:image" content={getMetaImage(restaurant)} />
        <meta property="twitter:title" content={`${restaurant.name} - Personalized Menu Recommendations`} />
        <meta property="twitter:description" content={getMetaDescription(restaurant)} />
        <meta property="twitter:image" content={getMetaImage(restaurant)} />
        <meta name="keywords" content={`${restaurant.name}, ${restaurant.cuisine || 'restaurant'}, menu recommendations, personalized dining, ${restaurant.address || ''}`} />
      </Helmet>

      <Header />
      <ErrorBoundary>
        <div className="w-full h-[30vh] sm:h-[40vh] md:h-[50vh] relative">
          <img 
            src={restaurant?.photos?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
            alt={`${restaurant.name} hero image`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <ActionButtons />
        </div>

        <SavePrompt />

        <div className="container mx-auto px-4 sm:px-6 -mt-10 relative z-10 max-w-3xl">
          <div className="space-y-8">
            <ErrorBoundary>
              <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                <RestaurantInfo restaurant={restaurant} />
                <div className="mt-6">
                  <DirectionsButton 
                    address={restaurant.address} 
                    name={restaurant.name} 
                  />
                </div>
              </div>
            </ErrorBoundary>

            <ErrorBoundary>
              <RestaurantSummary restaurant={restaurant} />
            </ErrorBoundary>
            
            <ErrorBoundary>
              <MenuSection 
                menu={restaurant?.menu} 
                photos={restaurant?.photos}
                reviews={restaurant?.googleReviews}
                menuUrl={restaurant?.website}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <SimilarRestaurants placeId={restaurant.id} />
            </ErrorBoundary>

            <ErrorBoundary>
              <AmenitiesSection restaurant={restaurant} />
            </ErrorBoundary>
            
            {restaurant?.photos && (
              <ErrorBoundary>
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                  <PhotosSection photos={restaurant.photos} />
                </div>
              </ErrorBoundary>
            )}
            
            {restaurant?.googleReviews && (
              <ErrorBoundary>
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                  <ReviewsSection reviews={restaurant.googleReviews} />
                </div>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default RestaurantDetails;