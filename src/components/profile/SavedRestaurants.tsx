import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import SavedRestaurantCard from "./SavedRestaurantCard";
import SavedRestaurantsEmpty from "./SavedRestaurantsEmpty";
import SavedRestaurantsSkeleton from "./SavedRestaurantsSkeleton";
import { toast } from "sonner";

const SavedRestaurants = () => {
  const [savedRestaurants, setSavedRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    const fetchSavedRestaurants = async () => {
      if (!session?.user) return;

      try {
        console.log("🔍 Fetching saved restaurants for user:", session.user.id);
        const { data, error } = await supabase
          .from('saved_restaurants')
          .select(`
            id,
            name,
            image_url,
            cuisine,
            rating,
            place_id,
            created_at,
            address
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("❌ Error fetching saved restaurants:", error);
          throw error;
        }

        console.log("✅ Raw saved restaurants data:", data);
        setSavedRestaurants(data || []);
      } catch (error) {
        console.error("Failed to fetch saved restaurants:", error);
        toast.error("Failed to load saved restaurants");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedRestaurants();
  }, [session]);

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    try {
      console.log("🗑️ Removing restaurant with ID:", id);
      const { error } = await supabase
        .from('saved_restaurants')
        .delete()
        .eq('id', id)
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      setSavedRestaurants(prev => prev.filter(restaurant => restaurant.id !== id));
      toast.success("Restaurant removed from saved list");
    } catch (error) {
      console.error("Error removing restaurant:", error);
      toast.error("Failed to remove restaurant");
    }
  };

  if (isLoading) {
    return <SavedRestaurantsSkeleton />;
  }

  if (!savedRestaurants.length) {
    return <SavedRestaurantsEmpty />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedRestaurants.map((restaurant) => (
        <SavedRestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
};

export default SavedRestaurants;