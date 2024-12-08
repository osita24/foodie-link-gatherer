import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BookMarked, Star, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { useRestaurantMatch } from "@/hooks/useRestaurantMatch";

interface SavedRestaurant {
  id: string;
  name: string;
  image_url: string | null;
  cuisine: string | null;
  rating: number | null;
  place_id: string;
  created_at: string;
  address?: string;
}

const SavedRestaurants = () => {
  const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const session = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSavedRestaurants = async () => {
      if (!session?.user?.id) {
        console.log("No user session found");
        return;
      }

      try {
        console.log("Fetching saved restaurants for user:", session.user.id);
        const { data: restaurants, error } = await supabase
          .from("saved_restaurants")
          .select("*")
          .eq("user_id", session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching saved restaurants:", error);
          toast({
            title: "Error",
            description: "Failed to load your saved restaurants. Please try again.",
            variant: "destructive",
          });
          return;
        }

        console.log("Raw restaurants data from Supabase:", restaurants);

        if (!restaurants || restaurants.length === 0) {
          console.log("No saved restaurants found");
          setSavedRestaurants([]);
          setLoading(false);
          return;
        }

        // Map the restaurants data to ensure all required fields are present
        const mappedRestaurants = restaurants.map(restaurant => ({
          id: restaurant.id,
          name: restaurant.name || 'Unknown Restaurant',
          image_url: restaurant.image_url,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          place_id: restaurant.place_id,
          created_at: restaurant.created_at,
          address: restaurant.address
        }));

        console.log("Mapped restaurants data:", mappedRestaurants);
        setSavedRestaurants(mappedRestaurants);
      } catch (error) {
        console.error("Error in fetchSavedRestaurants:", error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRestaurants();
  }, [session?.user?.id, toast]);

  const handleRemoveRestaurant = async (e: React.MouseEvent, restaurantId: string) => {
    e.stopPropagation();
    try {
      console.log("Removing restaurant with ID:", restaurantId);
      const { error } = await supabase
        .from("saved_restaurants")
        .delete()
        .eq("id", restaurantId);

      if (error) throw error;

      setSavedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      toast({
        title: "Restaurant removed",
        description: "The restaurant has been removed from your saved list.",
      });
    } catch (error) {
      console.error("Error removing restaurant:", error);
      toast({
        title: "Error",
        description: "Failed to remove the restaurant. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-accent/50" />
            <CardContent className="p-4">
              <div className="h-6 bg-accent/50 rounded w-3/4 mb-2" />
              <div className="h-4 bg-accent/50 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (savedRestaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-accent p-6 mb-4">
          <BookMarked className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No saved restaurants yet</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          When you find restaurants you love, save them here to keep track of your favorite spots.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Discover Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedRestaurants.map((restaurant) => (
        <Card 
          key={restaurant.id} 
          className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer bg-card"
          onClick={() => navigate(`/restaurant/${restaurant.place_id}`)}
        >
          <div className="relative h-48">
            <img
              src={restaurant.image_url || "/placeholder.svg"}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <button 
              className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 transition-colors z-10 group/btn"
              onClick={(e) => handleRemoveRestaurant(e, restaurant.id)}
              aria-label="Remove from saved"
            >
              <BookMarked 
                className="w-5 h-5 text-primary transition-transform group-hover/btn:scale-110" 
              />
            </button>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {restaurant.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {restaurant.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{restaurant.rating.toFixed(1)}</span>
                  </div>
                )}
                {restaurant.cuisine && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span>{restaurant.cuisine}</span>
                  </>
                )}
              </div>
              {restaurant.address && (
                <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{restaurant.address}</span>
                </div>
              )}
              <div className="pt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Saved {new Date(restaurant.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedRestaurants;