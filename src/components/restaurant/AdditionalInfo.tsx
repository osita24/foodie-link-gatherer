import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Clock, Utensils, Wine, Coffee, Accessibility, Wifi, Car, Music, Sun, Cake, Cigarette } from "lucide-react";
import { RestaurantDetails } from "@/types/restaurant";

interface AdditionalInfoProps {
  restaurant: RestaurantDetails;
}

const AdditionalInfo = ({ restaurant }: AdditionalInfoProps) => {
  const features = [
    { available: restaurant.curbsidePickup, label: "Curbside Pickup", icon: Car },
    { available: restaurant.delivery, label: "Delivery", icon: Car },
    { available: restaurant.dineIn, label: "Dine-in", icon: Utensils },
    { available: restaurant.takeout, label: "Takeout", icon: Utensils },
    { available: restaurant.reservable, label: "Reservations Available", icon: Clock },
    { available: restaurant.wheelchairAccessible, label: "Wheelchair Accessible", icon: Accessibility },
    { available: restaurant.outdoorSeating, label: "Outdoor Seating", icon: Sun },
    { available: restaurant.hasWifi, label: "Free WiFi", icon: Wifi },
    { available: restaurant.hasParking, label: "Parking Available", icon: Car },
    { available: restaurant.hasLiveMusic, label: "Live Music", icon: Music },
    { available: restaurant.smokingAllowed, label: "Smoking Allowed", icon: Cigarette },
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
    { available: restaurant.servesCocktails, label: "Cocktails", icon: Wine },
    { available: restaurant.servesCoffee, label: "Coffee", icon: Coffee },
  ].filter(drink => drink.available);

  const food = [
    { available: restaurant.servesDessert, label: "Desserts", icon: Cake },
    { available: restaurant.servesVegetarianFood, label: "Vegetarian Options", icon: Utensils },
  ].filter(item => item.available);

  if (!features.length && !meals.length && !drinks.length && !food.length) {
    return null;
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <Info className="w-6 h-6 text-primary" />
          Restaurant Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {features.length > 0 && (
          <div className="animate-fade-up">
            <h3 className="font-semibold mb-3 text-lg text-primary/90">Features & Services</h3>
            <div className="flex flex-wrap gap-2">
              {features.map(feature => (
                <span
                  key={feature.label}
                  className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2 transition-colors duration-200"
                >
                  <feature.icon className="w-4 h-4" />
                  {feature.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {meals.length > 0 && (
          <div className="animate-fade-up">
            <h3 className="font-semibold mb-3 text-lg text-primary/90">Meal Service</h3>
            <div className="flex flex-wrap gap-2">
              {meals.map(meal => (
                <span
                  key={meal.label}
                  className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2 transition-colors duration-200"
                >
                  <meal.icon className="w-4 h-4" />
                  {meal.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {drinks.length > 0 && (
          <div className="animate-fade-up">
            <h3 className="font-semibold mb-3 text-lg text-primary/90">Drinks</h3>
            <div className="flex flex-wrap gap-2">
              {drinks.map(drink => (
                <span
                  key={drink.label}
                  className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2 transition-colors duration-200"
                >
                  <drink.icon className="w-4 h-4" />
                  {drink.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {food.length > 0 && (
          <div className="animate-fade-up">
            <h3 className="font-semibold mb-3 text-lg text-primary/90">Special Menu Items</h3>
            <div className="flex flex-wrap gap-2">
              {food.map(item => (
                <span
                  key={item.label}
                  className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2 transition-colors duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {restaurant.hasHappyHour && (
          <div className="animate-fade-up mt-4">
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm inline-flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Happy Hour Available
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalInfo;