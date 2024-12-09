import { useParams } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { useRestaurantData } from "@/hooks/useRestaurantData";
import RestaurantInfo from "@/components/restaurant/RestaurantInfo";
import PhotosSection from "@/components/restaurant/PhotosSection";
import MenuSection from "@/components/restaurant/menu/MenuSection";
import ReviewsSection from "@/components/restaurant/ReviewsSection";
import RestaurantSummary from "@/components/restaurant/RestaurantSummary";
import MatchScoreCard from "@/components/restaurant/MatchScoreCard";
import MatchScorePrompt from "@/components/restaurant/MatchScorePrompt";
import ProfileCompletionNudge from "@/components/restaurant/ProfileCompletionNudge";

const RestaurantDetails = () => {
  const { placeId } = useParams();
  const session = useSession();
  const { restaurant, isLoading, error } = useRestaurantData(placeId);

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Error Loading Restaurant</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !restaurant) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <RestaurantInfo restaurant={restaurant} />
      
      {session?.user ? (
        <>
          <ProfileCompletionNudge />
          <MatchScoreCard restaurant={restaurant} />
          <RestaurantSummary restaurant={restaurant} />
        </>
      ) : (
        <MatchScorePrompt />
      )}

      <PhotosSection photos={restaurant.photos} />
      <MenuSection menu={restaurant.menu} />
      <ReviewsSection reviews={restaurant.reviews} />
    </div>
  );
};

export default RestaurantDetails;