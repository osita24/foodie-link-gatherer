import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, UtensilsCrossed, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedRestaurants = async () => {
      try {
        console.log("Fetching saved restaurants...");
        const { data: restaurants, error } = await supabase
          .from("saved_restaurants")
          .select("*")
          .order('created_at', { ascending: false });

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
    return <div>Loading...</div>;
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

  const formatCuisine = (cuisine: string | null) => {
    if (!cuisine) return null;
    return cuisine
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedRestaurants.map((restaurant) => (
        <Card 
          key={restaurant.id} 
          className="overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(`/restaurant/${restaurant.place_id}`)}
        >
          <div className="relative h-48">
            <img
              src={restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <button 
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
              onClick={async (e) => {
                e.stopPropagation();
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
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
            {restaurant.cuisine && (
              <p className="text-muted-foreground text-sm mb-2">
                {formatCuisine(restaurant.cuisine)}
              </p>
            )}
            {restaurant.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedRestaurants;