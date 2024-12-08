import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import RestaurantPreviewCard from "../restaurant/RestaurantPreviewCard";
import SavedRestaurantsEmpty from "./SavedRestaurantsEmpty";
import SavedRestaurantsSkeleton from "./SavedRestaurantsSkeleton";

const SavedRestaurants = () => {
  const [savedRestaurants, setSavedRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    const fetchSavedRestaurants = async () => {
      if (!session?.user) return;

      try {
        console.log("🔍 Fetching saved restaurants...");
        const { data, error } = await supabase
          .from('saved_restaurants')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("❌ Error fetching saved restaurants:", error);
          throw error;
        }

        console.log("✅ Fetched saved restaurants:", data);
        setSavedRestaurants(data || []);
      } catch (error) {
        console.error("Failed to fetch saved restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedRestaurants();
  }, [session]);

  if (isLoading) {
    return <SavedRestaurantsSkeleton />;
  }

  if (!savedRestaurants.length) {
    return <SavedRestaurantsEmpty />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedRestaurants.map((restaurant) => (
        <RestaurantPreviewCard
          key={restaurant.id}
          id={restaurant.place_id}
          name={restaurant.name}
          rating={restaurant.rating}
          address={restaurant.address}
          imageUrl={restaurant.image_url}
          cuisine={restaurant.cuisine}
        />
      ))}
    </div>
  );
};

export default SavedRestaurants;