import { RestaurantDetails } from "@/types/restaurant";
import RestaurantInfo from "../RestaurantInfo";
import MenuSection from "../MenuSection";
import AdditionalInfo from "../AdditionalInfo";
import PhotosSection from "../PhotosSection";
import ReviewsSection from "../ReviewsSection";

interface MainContentProps {
  restaurant: RestaurantDetails;
}

const MainContent = ({ restaurant }: MainContentProps) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <RestaurantInfo restaurant={restaurant} />
      </div>
      
      <div className="block lg:hidden space-y-6">
        <MenuSection 
          menu={restaurant?.menu} 
          photos={restaurant?.photos}
          reviews={restaurant?.googleReviews}
        />
      </div>

      <div className="hidden lg:block space-y-6">
        <MenuSection 
          menu={restaurant?.menu} 
          photos={restaurant?.photos}
          reviews={restaurant?.googleReviews}
        />
        <AdditionalInfo restaurant={restaurant} />
        {restaurant?.photos && <PhotosSection photos={restaurant.photos} />}
        {restaurant?.googleReviews && <ReviewsSection reviews={restaurant.googleReviews} />}
      </div>

      <div className="block lg:hidden space-y-6">
        <AdditionalInfo restaurant={restaurant} />
        {restaurant?.photos && <PhotosSection photos={restaurant.photos} />}
        {restaurant?.googleReviews && <ReviewsSection reviews={restaurant.googleReviews} />}
      </div>
    </div>
  );
};

export default MainContent;