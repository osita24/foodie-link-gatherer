import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import RestaurantInfo from "@/components/restaurant/RestaurantInfo";
import PopularItems from "@/components/restaurant/PopularItems";
import MenuSection from "@/components/restaurant/MenuSection";
import PhotosSection from "@/components/restaurant/PhotosSection";
import ReviewsSection from "@/components/restaurant/ReviewsSection";
import MatchScoreCard from "@/components/restaurant/MatchScoreCard";
import ActionButtons from "@/components/restaurant/ActionButtons";
import OrderSection from "@/components/restaurant/OrderSection";
import { useRestaurantData } from "@/hooks/useRestaurantData";

const RestaurantDetails = () => {
  const { id = '' } = useParams();
  const { data: restaurant, isLoading, error } = useRestaurantData(id);

  const matchCategories = [
    {
      category: "Taste Profile",
      score: 90,
      description: "Matches your preference for spicy Asian cuisine",
      icon: "🌶️"
    },
    {
      category: "Price Range",
      score: 85,
      description: "Within your typical dining budget",
      icon: "💰"
    },
    {
      category: "Atmosphere",
      score: 95,
      description: "Casual dining with modern ambiance",
      icon: "✨"
    },
    {
      category: "Service",
      score: 88,
      description: "Known for attentive staff",
      icon: "👨‍🍳"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error loading restaurant details</h2>
          <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
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
              {restaurant && <RestaurantInfo restaurant={restaurant} />}
            </div>
            <PopularItems />
            <MenuSection menu={restaurant?.menu} />
            {restaurant && <PhotosSection photos={restaurant.photos} />}
            {restaurant?.googleReviews && <ReviewsSection reviews={restaurant.googleReviews} />}
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 self-start">
            <MatchScoreCard categories={matchCategories} />
            <OrderSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;