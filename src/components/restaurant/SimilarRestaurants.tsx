import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantPreviewCard } from "./RestaurantPreviewCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "lucide-react";

interface SimilarRestaurantsProps {
  placeId: string;
}

const SimilarRestaurants = ({ placeId }: SimilarRestaurantsProps) => {
  const [similarRestaurants, setSimilarRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarRestaurants = async () => {
      try {
        console.log("🔍 Fetching similar restaurants for:", placeId);
        const { data, error } = await supabase
          .from("similar_restaurants")
          .select("similar_place_id, similarity_score")
          .eq("place_id", placeId)
          .order("similarity_score", { ascending: false })
          .limit(3);

        if (error) throw error;

        if (data && data.length > 0) {
          console.log("✨ Found similar restaurants:", data);
          const restaurantDetails = await Promise.all(
            data.map(async (similar) => {
              const { data: details } = await supabase.functions.invoke("google-maps-proxy", {
                body: { placeId: similar.similar_place_id }
              });
              return {
                ...details?.result?.result,
                similarity_score: similar.similarity_score
              };
            })
          );
          setSimilarRestaurants(restaurantDetails);
        }
      } catch (error) {
        console.error("❌ Error fetching similar restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (placeId) {
      fetchSimilarRestaurants();
    }
  }, [placeId]);

  if (isLoading || similarRestaurants.length === 0) return null;

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Link className="h-5 w-5 text-primary" />
          Similar Restaurants
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {similarRestaurants.map((restaurant) => (
          <RestaurantPreviewCard
            key={restaurant.place_id}
            restaurant={{
              id: restaurant.place_id,
              name: restaurant.name,
              rating: restaurant.rating,
              reviews: restaurant.user_ratings_total,
              address: restaurant.formatted_address || restaurant.vicinity,
              photos: restaurant.photos?.map((photo: any) => 
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`
              ) || [],
              priceLevel: restaurant.price_level,
            }}
            similarityScore={restaurant.similarity_score}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default SimilarRestaurants;