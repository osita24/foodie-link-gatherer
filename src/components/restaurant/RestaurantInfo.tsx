import { Phone, MapPin, Clock, Globe } from "lucide-react";
import { RestaurantDetails } from "@/types/restaurant";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";

interface RestaurantInfoProps {
  restaurant: RestaurantDetails;
}

const RestaurantInfo = ({ restaurant }: RestaurantInfoProps) => {
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const RatingStars = ({ rating }: { rating: number }) => {
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <RatingStars rating={restaurant.rating} />
          <span className="text-sm text-muted-foreground">
            {formatReviewCount(restaurant.reviews)} reviews
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 hover:text-primary transition-colors text-sm sm:text-base">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>{restaurant.address}</span>
        </div>
        <div className="flex items-center gap-2 hover:text-primary transition-colors text-sm sm:text-base">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>{getTodayHours(restaurant.hours)}</span>
        </div>
        {restaurant.phone && (
          <div className="flex items-center gap-2 hover:text-primary transition-colors text-sm sm:text-base">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>{formatPhoneNumber(restaurant.phone)}</span>
          </div>
        )}
        {restaurant.website && (
          <div className="flex items-center gap-2 hover:text-primary transition-colors text-sm sm:text-base">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
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
