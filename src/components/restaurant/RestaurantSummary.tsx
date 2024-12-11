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
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        console.log("👤 User preferences loaded:", preferences);

        if (!preferences) {
          console.log("❌ No preferences found for user");
          return;
        }

        // Generate dietary insights
        const dietaryInsights = generateDietaryInsights(restaurant, preferences);

        const { data, error } = await supabase.functions.invoke("restaurant-summary", {
          body: { 
            restaurant,
            preferences: {
              ...preferences,
              dietaryInsights,
              cuisine_preferences: preferences.cuisine_preferences || [],
              dietary_restrictions: preferences.dietary_restrictions || [],
              favorite_ingredients: preferences.favorite_ingredients || [],
              favorite_proteins: preferences.favorite_proteins || [],
              atmosphere_preferences: preferences.atmosphere_preferences || [],
            }
          }
        });

        if (error) {
          console.error("❌ Error generating summary:", error);
          throw error;
        }

        console.log("✨ Generated summary:", data);
        setSummary(data);
      } catch (error) {
        console.error("❌ Error generating summary:", error);
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