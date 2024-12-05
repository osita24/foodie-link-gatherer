import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Clock, Utensils, Wine, Coffee, Accessibility } from "lucide-react";
import { RestaurantDetails } from "@/types/restaurant";
import InfoSection from "./info/InfoSection";

interface AdditionalInfoProps {
  restaurant: RestaurantDetails;
}

const AdditionalInfo = ({ restaurant }: AdditionalInfoProps) => {
  console.log("Rendering AdditionalInfo with data:", restaurant);

  const features = [
    { available: restaurant.curbsidePickup, label: "Curbside Pickup", icon: Clock },
    { available: restaurant.delivery, label: "Delivery", icon: Clock },
    { available: restaurant.dineIn, label: "Dine-in", icon: Utensils },
    { available: restaurant.takeout, label: "Takeout", icon: Utensils },
    { available: restaurant.reservable, label: "Reservations", icon: Clock },
    { available: restaurant.wheelchairAccessible, label: "Wheelchair Accessible", icon: Accessibility },
  ].filter(feature => feature.available);

  const meals = [
    { available: restaurant.servesBreakfast, label: "Breakfast", icon: Coffee },
    { available: restaurant.servesBrunch, label: "Brunch", icon: Coffee },
    { available: restaurant.servesLunch, label: "Lunch", icon: Utensils },
    { available: restaurant.servesDinner, label: "Dinner", icon: Utensils },
  ].filter(meal => meal.available);

  const drinks = [
    { available: restaurant.servesBeer, label: "Beer", icon: Wine },
    { available: restaurant.servesWine, label: "Wine", icon: Wine },
  ].filter(drink => drink.available);

  const vegetarianOption = restaurant.servesVegetarianFood ? [
    { available: true, label: "Vegetarian Options", icon: Utensils }
  ] : [];

  if (!features.length && !meals.length && !drinks.length && !vegetarianOption.length) {
    return null;
  }

  return (
    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/20 pb-6">
        <CardTitle className="flex items-center gap-2.5 text-secondary">
          <Info className="w-5 h-5 text-primary" />
          Additional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary/80 mb-3">Services & Amenities</h4>
            <InfoSection features={features} />
          </div>
        )}
        
        {meals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary/80 mb-3">Meal Service</h4>
            <InfoSection features={meals} />
          </div>
        )}
        
        {drinks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary/80 mb-3">Beverages</h4>
            <InfoSection features={drinks} />
          </div>
        )}
        
        {vegetarianOption.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary/80 mb-3">Dietary Options</h4>
            <InfoSection features={vegetarianOption} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalInfo;