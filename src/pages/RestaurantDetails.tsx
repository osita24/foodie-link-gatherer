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
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
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
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="w-full h-[300px] relative">
          <img 
            src={restaurant?.photos?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
            alt="Restaurant hero"
            className="w-full h-full object-cover"
          />
          <ActionButtons />
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {restaurant && <RestaurantInfo restaurant={restaurant} />}
              <PopularItems />
              <MenuSection />
              {restaurant && <PhotosSection photos={restaurant.photos} />}
              {restaurant?.googleReviews && <ReviewsSection reviews={restaurant.googleReviews} />}
            </div>

            <div className="space-y-8 md:sticky md:top-24 self-start">
              <MatchScoreCard categories={matchCategories} />
              <OrderSection />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantDetails;