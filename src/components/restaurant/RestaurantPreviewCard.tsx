import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RestaurantPreviewProps {
  restaurant: {
    id: string;
    name: string;
    rating: number;
    address: string;
    photos?: string[];
    priceLevel?: number;
  };
  similarityScore?: number;
}

export const RestaurantPreviewCard = ({ restaurant, similarityScore }: RestaurantPreviewProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={restaurant.photos?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-1">{restaurant.name}</h3>
            <div className="flex flex-col gap-1">
              {typeof restaurant.rating === 'number' && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
              )}
              {similarityScore && (
                <div className="text-sm text-muted-foreground">
                  {similarityScore}% match
                </div>
              )}
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{restaurant.address}</p>
      </CardContent>
    </Card>
  );
};