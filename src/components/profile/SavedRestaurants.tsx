import { Card, CardContent } from "@/components/ui/card";
import { Heart, UtensilsCrossed } from "lucide-react";

const SavedRestaurants = () => {
  // Placeholder data - will be replaced with real data later
  const savedRestaurants = [];

  if (savedRestaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <UtensilsCrossed className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No saved restaurants yet</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          When you find restaurants you love, save them here to keep track of your favorite spots.
        </p>
        <a 
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Discover Restaurants
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedRestaurants.map((restaurant) => (
        <Card key={restaurant.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="relative h-48">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
              <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
            </button>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
            <p className="text-muted-foreground text-sm">{restaurant.cuisine}</p>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm">{restaurant.rating}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedRestaurants;