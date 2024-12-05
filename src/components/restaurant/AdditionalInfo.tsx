import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Clock, Utensils, Wine, Coffee, Accessibility } from "lucide-react";
import { RestaurantDetails } from "@/types/restaurant";

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

  if (!features.length && !meals.length && !drinks.length && !restaurant.servesVegetarianFood) {
    return null;
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-up">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Info className="w-6 h-6" />
          Additional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {features.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-secondary">Features & Services</h3>
            <div className="flex flex-wrap gap-2">
              {features.map(feature => (
                <span
                  key={feature.label}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1.5 hover:bg-primary/20 transition-colors duration-200"
                >
                  <feature.icon className="w-4 h-4" />
                  {feature.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {meals.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-secondary">Meal Service</h3>
            <div className="flex flex-wrap gap-2">
              {meals.map(meal => (
                <span
                  key={meal.label}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1.5 hover:bg-primary/20 transition-colors duration-200"
                >
                  <meal.icon className="w-4 h-4" />
                  {meal.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {drinks.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-secondary">Drinks</h3>
            <div className="flex flex-wrap gap-2">
              {drinks.map(drink => (
                <span
                  key={drink.label}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1.5 hover:bg-primary/20 transition-colors duration-200"
                >
                  <drink.icon className="w-4 h-4" />
                  {drink.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {restaurant.servesVegetarianFood && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-secondary">Dietary Options</h3>
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm inline-flex items-center gap-1.5">
              <Utensils className="w-4 h-4" />
              Vegetarian Options Available
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalInfo;