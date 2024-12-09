import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurantData } from "@/hooks/useRestaurantData";
import { useParams } from "react-router-dom";

const OrderSection = () => {
  const { id: placeId } = useParams();
  const { data: restaurant } = useRestaurantData(placeId);

  console.log("🌐 Restaurant website URL:", restaurant?.website);

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow duration-300 mt-6">
      <CardHeader>
        <CardTitle>Book Now</CardTitle>
      </CardHeader>
      <CardContent>
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
            Visit Website
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderSection;