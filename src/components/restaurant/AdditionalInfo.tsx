import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Clock, Utensils, Wine, Coffee, Accessibility, MapPin, DollarSign, Sparkles } from "lucide-react";
import { RestaurantDetails } from "@/types/restaurant";

interface AdditionalInfoProps {
  restaurant: RestaurantDetails;
}

const AdditionalInfo = ({ restaurant }: AdditionalInfoProps) => {
  console.log("Rendering AdditionalInfo with data:", restaurant);

  const features = [
    { available: restaurant.curbsidePickup, label: "Curbside Pickup", icon: Clock, color: "text-blue-500" },
    { available: restaurant.delivery, label: "Delivery", icon: MapPin, color: "text-green-500" },
    { available: restaurant.dineIn, label: "Dine-in", icon: Utensils, color: "text-purple-500" },
    { available: restaurant.takeout, label: "Takeout", icon: Utensils, color: "text-orange-500" },
    { available: restaurant.reservable, label: "Reservations", icon: Clock, color: "text-pink-500" },
    { available: restaurant.wheelchairAccessible, label: "Wheelchair Accessible", icon: Accessibility, color: "text-indigo-500" },
  ].filter(feature => feature.available);

  const meals = [
    { available: restaurant.servesBreakfast, label: "Breakfast", icon: Coffee, color: "text-amber-600" },
    { available: restaurant.servesBrunch, label: "Brunch", icon: Coffee, color: "text-amber-500" },
    { available: restaurant.servesLunch, label: "Lunch", icon: Utensils, color: "text-emerald-500" },
    { available: restaurant.servesDinner, label: "Dinner", icon: Utensils, color: "text-blue-600" },
  ].filter(meal => meal.available);

  const drinks = [
    { available: restaurant.servesBeer, label: "Beer", icon: Wine, color: "text-yellow-600" },
    { available: restaurant.servesWine, label: "Wine", icon: Wine, color: "text-red-500" },
  ].filter(drink => drink.available);

  if (!features.length && !meals.length && !drinks.length && !restaurant.servesVegetarianFood) {
    return null;
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-up bg-white/50 backdrop-blur-sm border-accent/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="w-6 h-6 animate-pulse" />
          Restaurant Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {features.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-secondary flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Features & Services
            </h3>
            <div className="flex flex-wrap gap-3">
              {features.map(feature => (
                <span
                  key={feature.label}
                  className="px-4 py-2 bg-white rounded-full text-sm flex items-center gap-2 
                           shadow-sm hover:shadow-md transition-all duration-200 
                           hover:scale-105 cursor-default border border-accent/10"
                >
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-secondary">{feature.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {meals.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-secondary flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              Meal Service
            </h3>
            <div className="flex flex-wrap gap-3">
              {meals.map(meal => (
                <span
                  key={meal.label}
                  className="px-4 py-2 bg-white rounded-full text-sm flex items-center gap-2 
                           shadow-sm hover:shadow-md transition-all duration-200 
                           hover:scale-105 cursor-default border border-accent/10"
                >
                  <meal.icon className={`w-4 h-4 ${meal.color}`} />
                  <span className="text-secondary">{meal.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {drinks.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-secondary flex items-center gap-2">
              <Wine className="w-5 h-5 text-primary" />
              Drinks
            </h3>
            <div className="flex flex-wrap gap-3">
              {drinks.map(drink => (
                <span
                  key={drink.label}
                  className="px-4 py-2 bg-white rounded-full text-sm flex items-center gap-2 
                           shadow-sm hover:shadow-md transition-all duration-200 
                           hover:scale-105 cursor-default border border-accent/10"
                >
                  <drink.icon className={`w-4 h-4 ${drink.color}`} />
                  <span className="text-secondary">{drink.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {restaurant.servesVegetarianFood && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-secondary flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              Dietary Options
            </h3>
            <span className="px-4 py-2 bg-white rounded-full text-sm inline-flex items-center gap-2 
                         shadow-sm hover:shadow-md transition-all duration-200 
                         hover:scale-105 cursor-default border border-accent/10">
              <Utensils className="w-4 h-4 text-green-500" />
              <span className="text-secondary">Vegetarian Options Available</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalInfo;