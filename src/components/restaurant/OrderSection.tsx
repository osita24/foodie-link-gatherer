import { ExternalLink, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurantData } from "@/hooks/useRestaurantData";
import { useParams } from "react-router-dom";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";

const OrderSection = () => {
  const { id: placeId } = useParams();
  const { data: restaurant } = useRestaurantData(placeId);

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow duration-300 mt-6">
      <CardHeader>
        <CardTitle>Contact & Booking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {restaurant?.phone && (
          <Button
            variant="outline"
            className="w-full justify-between hover:bg-primary/5"
            asChild
          >
            <a href={`tel:${restaurant.phone}`}>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{formatPhoneNumber(restaurant.phone)}</span>
              </div>
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        )}
        
        <Button
          variant="outline"
          className="w-full justify-between hover:bg-primary/5"
          asChild
          disabled={!restaurant?.website}
        >
          <a 
            href={restaurant?.website || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Visit Website</span>
            </div>
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderSection;