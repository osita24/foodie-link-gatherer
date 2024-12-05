import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Clock, Utensils, Wine, Coffee, Accessibility } from "lucide-react";
import { RestaurantDetails } from "@/types/restaurant";

interface AdditionalInfoProps {
  restaurant: RestaurantDetails;
}

const AdditionalInfo = ({ restaurant }: AdditionalInfoProps) => {
  console.log("Rendering AdditionalInfo with data:", restaurant);

  const features = [
    { available: restaurant.curbsidePickup, label: "Curbside Pickup", icon: Clock, color: "text-primary" },
    { available: restaurant.delivery, label: "Delivery", icon: Clock, color: "text-primary" },
    { available: restaurant.dineIn, label: "Dine-in", icon: Utensils, color: "text-primary" },
    { available: restaurant.takeout, label: "Takeout", icon: Utensils, color: "text-primary" },
    { available: restaurant.reservable, label: "Reservations", icon: Clock, color: "text-primary" },
    { available: restaurant.wheelchairAccessible, label: "Wheelchair Accessible", icon: Accessibility, color: "text-primary" },
  ].filter(feature => feature.available);

  const meals = [
    { available: restaurant.servesBreakfast, label: "Breakfast", icon: Coffee, color: "text-primary" },
    { available: restaurant.servesBrunch, label: "Brunch", icon: Coffee, color: "text-primary" },
    { available: restaurant.servesLunch, label: "Lunch", icon: Utensils, color: "text-primary" },
    { available: restaurant.servesDinner, label: "Dinner", icon: Utensils, color: "text-primary" },
  ].filter(meal => meal.available);

  const drinks = [
    { available: restaurant.servesBeer, label: "Beer", icon: Wine, color: "text-primary" },
    { available: restaurant.servesWine, label: "Wine", icon: Wine, color: "text-primary" },
  ].filter(drink => drink.available);

  if (!features.length && !meals.length && !drinks.length && !restaurant.servesVegetarianFood) {
    return null;
  }

  return (
    <Card className="overflow-hidden bg-background/80 backdrop-blur-sm border-accent hover:shadow-md transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-accent to-background pb-4">
        <CardTitle className="flex items-center gap-2 text-secondary text-lg">
          <Info className="w-5 h-5 text-primary" />
          Additional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {features.map(feature => (
              <span
                key={feature.label}
                className="px-3 py-1 bg-accent/50 rounded-full text-sm flex items-center gap-1.5 
                         hover:bg-accent transition-colors duration-200 cursor-default"
              >
                <feature.icon className={`w-3.5 h-3.5 ${feature.color}`} />
                <span className="text-secondary">{feature.label}</span>
              </span>
            ))}
          </div>
        )}

        {meals.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {meals.map(meal => (
              <span
                key={meal.label}
                className="px-3 py-1 bg-accent/50 rounded-full text-sm flex items-center gap-1.5 
                         hover:bg-accent transition-colors duration-200 cursor-default"
              >
                <meal.icon className={`w-3.5 h-3.5 ${meal.color}`} />
                <span className="text-secondary">{meal.label}</span>
              </span>
            ))}
          </div>
        )}

        {drinks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {drinks.map(drink => (
              <span
                key={drink.label}
                className="px-3 py-1 bg-accent/50 rounded-full text-sm flex items-center gap-1.5 
                         hover:bg-accent transition-colors duration-200 cursor-default"
              >
                <drink.icon className={`w-3.5 h-3.5 ${drink.color}`} />
                <span className="text-secondary">{drink.label}</span>
              </span>
            ))}
          </div>
        )}

        {restaurant.servesVegetarianFood && (
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-accent/50 rounded-full text-sm flex items-center gap-1.5 
                         hover:bg-accent transition-colors duration-200 cursor-default">
              <Utensils className="w-3.5 h-3.5 text-primary" />
              <span className="text-secondary">Vegetarian Options</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalInfo;