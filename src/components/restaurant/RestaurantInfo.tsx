import { Phone, MapPin, Clock, Globe, DollarSign } from "lucide-react";
import { RestaurantDetails } from "@/types/restaurant";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";
import ServiceOptions from "./ServiceOptions";

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

  const getPriceRangeDisplay = (priceLevel?: number) => {
    if (!priceLevel) return null;
    return (
      <div className="inline-flex items-center gap-0.5 px-3 py-1.5 bg-accent/30 rounded-full">
        {[...Array(priceLevel)].map((_, i) => (
          <DollarSign 
            key={i} 
            className="w-3.5 h-3.5 text-primary fill-primary/20" 
            strokeWidth={2.5}
          />
        ))}
        {[...Array(4 - (priceLevel || 0))].map((_, i) => (
          <DollarSign 
            key={i + priceLevel} 
            className="w-3.5 h-3.5 text-gray-300" 
            strokeWidth={2.5}
          />
        ))}
      </div>
    );
  };

  console.log("Restaurant data in RestaurantInfo:", restaurant);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-left">{restaurant?.name ?? 'Restaurant Name Not Available'}</h1>
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <RatingStars rating={restaurant?.rating} />
          <span className="text-muted-foreground">
            {formatReviewCount(restaurant?.reviews)} reviews
          </span>
          {getPriceRangeDisplay(restaurant?.priceLevel)}
        </div>
        <ServiceOptions 
          delivery={restaurant?.delivery}
          takeout={restaurant?.takeout}
          dineIn={restaurant?.dineIn}
          reservable={restaurant?.reservable}
        />
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