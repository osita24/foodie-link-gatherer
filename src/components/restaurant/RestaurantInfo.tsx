import { Phone, MapPin, Clock, Globe } from "lucide-react";
import { RestaurantDetails } from "@/types/restaurant";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";

interface RestaurantInfoProps {
  restaurant: RestaurantDetails;
}

const RestaurantInfo = ({ restaurant }: RestaurantInfoProps) => {
  const formatRating = (rating: number | undefined) => {
    return rating?.toFixed(1) ?? "N/A";
  };

  const formatReviewCount = (count: number | undefined) => {
    if (!count) return "0";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const RatingStars = ({ rating }: { rating: number | undefined }) => {
    return (
      <div className="flex items-center">
        <span className="text-yellow-400">★</span>
        <span className="ml-1">{formatRating(rating)}</span>
      </div>
    );
  };

  const getTodayHours = (hoursText?: string): string => {
    if (!hoursText) return 'Hours not available';
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = daysOfWeek[new Date().getDay()];
    
    try {
      if (hoursText.includes('|')) {
        const allHours = hoursText.split('|').map(day => day.trim());
        const todayHours = allHours.find(day => day.startsWith(today));
        return todayHours ? todayHours : 'Hours not available for today';
      }
      
      return hoursText;
    } catch (error) {
      console.error('Error parsing hours:', error);
      return 'Hours not available';
    }
  };

  // Add console logs to help debug the data
  console.log("Restaurant data in RestaurantInfo:", restaurant);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-left">{restaurant?.name ?? 'Restaurant Name Not Available'}</h1>
        <div className="flex items-center gap-4">
          <RatingStars rating={restaurant?.rating} />
          <span className="text-muted-foreground">
            {formatReviewCount(restaurant?.reviews)} reviews
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {restaurant?.address && (
          <div className="flex items-start gap-2 hover:text-primary transition-colors">
            <MapPin className="w-5 h-5 mt-1 shrink-0" />
            <span className="text-left">{restaurant.address}</span>
          </div>
        )}
        <div className="flex items-start gap-2 hover:text-primary transition-colors">
          <Clock className="w-5 h-5 mt-1 shrink-0" />
          <span className="text-left">{getTodayHours(restaurant?.hours)}</span>
        </div>
        {restaurant?.phone && (
          <div className="flex items-start gap-2 hover:text-primary transition-colors">
            <Phone className="w-5 h-5 mt-1 shrink-0" />
            <span className="text-left">{formatPhoneNumber(restaurant.phone)}</span>
          </div>
        )}
        {restaurant?.website && (
          <div className="flex items-start gap-2 hover:text-primary transition-colors">
            <Globe className="w-5 h-5 mt-1 shrink-0" />
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-left"
            >
              Visit website
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantInfo;