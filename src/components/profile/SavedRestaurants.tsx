import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, UtensilsCrossed, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SavedRestaurant {
  id: string;
  name: string;
  image_url: string | null;
  cuisine: string | null;
  rating: number | null;
  place_id: string;
}

const SavedRestaurants = () => {
  const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedRestaurants = async () => {
      try {
        console.log("Fetching saved restaurants...");
        const { data: restaurants, error } = await supabase
          .from("saved_restaurants")
          .select("*");

        if (error) {
          console.error("Error fetching saved restaurants:", error);
          return;
        }

        console.log("Fetched restaurants:", restaurants);
        setSavedRestaurants(restaurants);
      } catch (error) {
        console.error("Error in fetchSavedRestaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
          <div className="relative">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              {restaurant.rating && (
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                  </div>
                </div>
              )}
              <button 
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                onClick={async () => {
                  try {
                    await supabase
                      .from("saved_restaurants")
                      .delete()
                      .eq("id", restaurant.id);
                    setSavedRestaurants(prev => 
                      prev.filter(r => r.id !== restaurant.id)
                    );
                  } catch (error) {
                    console.error("Error removing restaurant:", error);
                  }
                }}
              >
                <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="font-semibold text-lg text-white mb-1">{restaurant.name}</h3>
              {restaurant.cuisine && (
                <p className="text-white/90 text-sm">{restaurant.cuisine}</p>
              )}
            </div>
            <img
              src={restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
              alt={restaurant.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <CardContent className="p-4" />
        </Card>
      ))}
    </div>
  );
};

export default SavedRestaurants;