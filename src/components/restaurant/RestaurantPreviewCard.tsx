import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RestaurantPreviewProps {
  id: string;
  name: string;
  rating: number;
  address: string;
  imageUrl?: string;
}

const RestaurantPreviewCard = ({ id, name, rating, address, imageUrl }: RestaurantPreviewProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="text-yellow-400 mr-1">★</span>
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{address}</p>
      </CardContent>
    </Card>
  );
};

export default RestaurantPreviewCard;