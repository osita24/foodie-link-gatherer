import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Clock, Utensils, Wine, Coffee, Accessibility } from "lucide-react";
import { RestaurantDetails } from "@/types/restaurant";

interface AdditionalInfoProps {
  restaurant: RestaurantDetails;
}

const AdditionalInfo = ({ restaurant }: AdditionalInfoProps) => {
  const features = [
    { available: restaurant.curbsidePickup, label: "Curbside Pickup" },
    { available: restaurant.delivery, label: "Delivery" },
    { available: restaurant.dineIn, label: "Dine-in" },
    { available: restaurant.takeout, label: "Takeout" },
    { available: restaurant.reservable, label: "Reservations" },
    { available: restaurant.wheelchairAccessible, label: "Wheelchair Accessible" },
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

  if (!features.length && !meals.length && !drinks.length) {
    return null;
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-6 h-6" />
          Additional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {features.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Features & Services</h3>
            <div className="flex flex-wrap gap-2">
              {features.map(feature => (
                <span
                  key={feature.label}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {feature.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {meals.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Meal Service</h3>
            <div className="flex flex-wrap gap-2">
              {meals.map(meal => (
                <span
                  key={meal.label}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1"
                >
                  <meal.icon className="w-4 h-4" />
                  {meal.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {drinks.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Drinks</h3>
            <div className="flex flex-wrap gap-2">
              {drinks.map(drink => (
                <span
                  key={drink.label}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1"
                >
                  <drink.icon className="w-4 h-4" />
                  {drink.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {restaurant.servesVegetarianFood && (
          <div>
            <h3 className="font-semibold mb-2">Dietary Options</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Vegetarian Options Available
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalInfo;