import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantDetails } from "@/types/restaurant";
import { UserPreferences } from "@/types/preferences";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { generateDietaryInsights } from "@/utils/restaurant/dietaryInsights";
import { LoadingSummary } from "./summary/LoadingSummary";
import { VerdictDisplay } from "./summary/VerdictDisplay";
import { SummaryResponse } from "./types/summary";
import { toast } from "sonner";

interface RestaurantSummaryProps {
  restaurant: RestaurantDetails;
}

const RestaurantSummary = ({ restaurant }: RestaurantSummaryProps) => {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    const generateSummary = async () => {
      if (!session?.user) return;

      console.log("🤖 Generating personalized summary for:", restaurant.name);
      try {
        const { data: preferences, error: preferencesError } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (preferencesError) {
          console.error("❌ Error fetching preferences:", preferencesError);
          throw preferencesError;
        }

        console.log("👤 User preferences loaded:", preferences);

        if (!preferences) {
          console.log("❌ No preferences found for user");
          return;
        }

        // Map database columns to UserPreferences type
        const mappedPreferences: UserPreferences = {
          cuisinePreferences: preferences.cuisine_preferences || [],
          dietaryRestrictions: preferences.dietary_restrictions || [],
          foodsToAvoid: preferences.favorite_ingredients || [],
          atmospherePreferences: preferences.atmosphere_preferences || [],
          favoriteIngredients: [],
          favoriteProteins: preferences.favorite_proteins || [],
          spiceLevel: preferences.spice_level || 3,
          priceRange: preferences.price_range || 'moderate',
          specialConsiderations: preferences.special_considerations || "",
        };

        // Generate dietary insights
        const dietaryInsights = generateDietaryInsights(restaurant, mappedPreferences);

        const { data, error } = await supabase.functions.invoke("restaurant-summary", {
          body: { 
            restaurant,
            preferences: {
              ...mappedPreferences,
              dietaryInsights
            }
          }
        });

        if (error) {
          console.error("❌ Error generating summary:", error);
          toast.error("Failed to generate restaurant summary");
          throw error;
        }

        console.log("✨ Generated summary:", data);
        setSummary(data);
      } catch (error) {
        console.error("❌ Error generating summary:", error);
        toast.error("Failed to generate restaurant summary");
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
  }, [restaurant, session]);

  if (!session?.user) return null;

  if (isLoading) {
    return <LoadingSummary />;
  }

  if (!summary) return null;

  return (
    <Card className="p-4 md:p-6 bg-background border-accent overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Cilantro Says</h3>
          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full border border-primary/20">BETA</span>
        </div>
      </div>
      
      <VerdictDisplay verdict={summary.verdict} reasons={summary.reasons} />
    </Card>
  );
};

export default RestaurantSummary;