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
    { available: restaurant.reservable, label: "Reservations", icon: Clock },
    { available: restaurant.wheelchairAccessible, label: "Accessible", icon: Accessibility },
    { available: restaurant.outdoorSeating, label: "Outdoor Seating", icon: Sun },
    { available: restaurant.hasWifi, label: "WiFi", icon: Wifi },
    { available: restaurant.hasParking, label: "Parking", icon: Car },
    { available: restaurant.hasLiveMusic, label: "Live Music", icon: Music },
    { available: restaurant.smokingAllowed, label: "Smoking Area", icon: Cigarette },
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
    { available: restaurant.servesVegetarianFood, label: "Vegetarian", icon: Utensils },
  ].filter(item => item.available);

  if (!features.length && !meals.length && !drinks.length && !food.length) {
    return null;
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardHeader className="bg-accent/30 py-4">
        <CardTitle className="flex items-center gap-2 text-lg text-secondary">
          <Info className="w-5 h-5" />
          Restaurant Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {features.length > 0 && (
          <div className="animate-fade-up">
            <h3 className="font-medium mb-2 text-sm text-secondary/80">Features & Services</h3>
            <div className="flex flex-wrap gap-1.5">
              {features.map(feature => (
                <span
                  key={feature.label}
                  className="px-2.5 py-1 bg-accent/40 hover:bg-accent/60 text-secondary rounded-full text-xs flex items-center gap-1.5 transition-colors duration-200"
                >
                  <feature.icon className="w-3.5 h-3.5" />
                  {feature.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {meals.length > 0 && (
          <div className="animate-fade-up">
            <h3 className="font-medium mb-2 text-sm text-secondary/80">Meal Service</h3>
            <div className="flex flex-wrap gap-1.5">
              {meals.map(meal => (
                <span
                  key={meal.label}
                  className="px-2.5 py-1 bg-accent/40 hover:bg-accent/60 text-secondary rounded-full text-xs flex items-center gap-1.5 transition-colors duration-200"
                >
                  <meal.icon className="w-3.5 h-3.5" />
                  {meal.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {drinks.length > 0 && (
          <div className="animate-fade-up">
            <h3 className="font-medium mb-2 text-sm text-secondary/80">Drinks</h3>
            <div className="flex flex-wrap gap-1.5">
              {drinks.map(drink => (
                <span
                  key={drink.label}
                  className="px-2.5 py-1 bg-accent/40 hover:bg-accent/60 text-secondary rounded-full text-xs flex items-center gap-1.5 transition-colors duration-200"
                >
                  <drink.icon className="w-3.5 h-3.5" />
                  {drink.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {food.length > 0 && (
          <div className="animate-fade-up">
            <h3 className="font-medium mb-2 text-sm text-secondary/80">Special Menu Items</h3>
            <div className="flex flex-wrap gap-1.5">
              {food.map(item => (
                <span
                  key={item.label}
                  className="px-2.5 py-1 bg-accent/40 hover:bg-accent/60 text-secondary rounded-full text-xs flex items-center gap-1.5 transition-colors duration-200"
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {restaurant.hasHappyHour && (
          <div className="animate-fade-up">
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Happy Hour Available
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalInfo;