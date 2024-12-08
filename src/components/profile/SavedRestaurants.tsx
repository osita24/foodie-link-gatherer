import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import SavedRestaurantCard from "./SavedRestaurantCard";
import SavedRestaurantsSkeleton from "./SavedRestaurantsSkeleton";
import SavedRestaurantsEmpty from "./SavedRestaurantsEmpty";

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
        setSavedRestaurants(restaurants || []);
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
    return <SavedRestaurantsSkeleton />;
  }

  if (savedRestaurants.length === 0) {
    return <SavedRestaurantsEmpty />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedRestaurants.map((restaurant) => (
        <SavedRestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onRemove={handleRemoveRestaurant}
        />
      ))}
    </div>
  );
};

export default SavedRestaurants;