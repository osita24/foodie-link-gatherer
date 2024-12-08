import { Card, CardContent } from "@/components/ui/card";
import { BookMarked, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SavedRestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    image_url: string | null;
    cuisine: string | null;
    rating: number | null;
    place_id: string;
    created_at: string;
    address?: string;
  };
  onRemove: (e: React.MouseEvent, id: string) => void;
}

const SavedRestaurantCard = ({ restaurant, onRemove }: SavedRestaurantCardProps) => {
  const navigate = useNavigate();
  const [realData, setRealData] = useState<any>(null);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        console.log("🔍 Fetching real data for restaurant:", restaurant.place_id);
        const { data: response, error } = await supabase.functions.invoke('google-maps-proxy', {
          body: { placeId: restaurant.place_id }
        });

        if (error) {
          console.error("❌ Error fetching restaurant details:", error);
          return;
        }

        if (response?.result?.result) {
          console.log("✅ Received real restaurant data:", response.result.result);
          setRealData(response.result.result);
        }
      } catch (error) {
        console.error("Failed to fetch restaurant details:", error);
      }
    };

    fetchRealData();
  }, [restaurant.place_id]);

  const displayData = {
    name: realData?.name || restaurant.name,
    image: realData?.photos?.[0]?.photo_reference 
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${realData.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`
      : restaurant.image_url,
    rating: realData?.rating || restaurant.rating,
    address: realData?.formatted_address || restaurant.address,
    cuisine: realData?.types?.[0]?.replace(/_/g, ' ') || restaurant.cuisine
  };

  return (
    <Card 
      key={restaurant.id} 
      className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer bg-card"
      onClick={() => navigate(`/restaurant/${restaurant.place_id}`)}
    >
      <div className="relative h-48 sm:h-56">
        <img
          src={displayData.image || "/placeholder.svg"}
          alt={displayData.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <button 
          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 transition-colors z-10 group/btn"
          onClick={(e) => onRemove(e, restaurant.id)}
          aria-label="Remove from saved"
        >
          <BookMarked 
            className="w-5 h-5 text-primary transition-transform group-hover/btn:scale-110" 
          />
        </button>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {displayData.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {displayData.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{displayData.rating.toFixed(1)}</span>
              </div>
            )}
            {displayData.cuisine && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="capitalize">{displayData.cuisine}</span>
              </>
            )}
          </div>
          {displayData.address && (
            <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{displayData.address}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedRestaurantCard;