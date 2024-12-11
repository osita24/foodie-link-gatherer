import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantDetails } from "@/types/restaurant";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RestaurantSummaryProps {
  restaurant: RestaurantDetails;
}

interface SummaryResponse {
  verdict: "PERFECT MATCH" | "WORTH EXPLORING" | "CONSIDER ALTERNATIVES";
  reasons: Array<{
    emoji: string;
    text: string;
  }>;
}

const generateDietaryInsights = (restaurant: RestaurantDetails, preferences: UserPreferences) => {
  const insights: string[] = [];
  
  // Check vegetarian/vegan options
  if (preferences.dietary_restrictions?.includes("Vegetarian")) {
    if (!restaurant.servesVegetarianFood) {
      insights.push("Limited vegetarian options - most dishes contain meat");
    } else {
      insights.push("Offers dedicated vegetarian menu items");
    }
  }

  if (preferences.dietary_restrictions?.includes("Vegan")) {
    const hasVeganOptions = restaurant.types?.some(type => 
      type.toLowerCase().includes('vegan') || type.toLowerCase().includes('vegetarian')
    );
    if (!hasVeganOptions) {
      insights.push("Very limited vegan options - most dishes contain animal products");
    }
  }

  // Check cuisine style match
  if (preferences.cuisine_preferences?.length) {
    const matchingCuisine = preferences.cuisine_preferences.find(cuisine => 
      restaurant.types?.some(type => type.toLowerCase().includes(cuisine.toLowerCase()))
    );
    if (!matchingCuisine) {
      insights.push(`Different cuisine style than your preferred ${preferences.cuisine_preferences[0].toLowerCase()}`);
    }
  }

  // Check preparation style preferences
  if (restaurant.types?.some(type => ['fast_food', 'burger'].includes(type.toLowerCase()))) {
    insights.push("Many dishes are fried or high in oil content");
  }

  // Check sodium content warning
  if (restaurant.types?.some(type => ['fast_food', 'chinese', 'korean'].includes(type.toLowerCase()))) {
    insights.push("Many dishes may be high in sodium");
  }

  return insights;
};

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
              // Ensure all required fields are present
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

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case "PERFECT MATCH":
        return "bg-success/10 text-success border-success/20 shadow-[0_0_15px_rgba(104,160,99,0.15)]";
      case "WORTH EXPLORING":
        return "bg-warning/10 text-warning border-warning/20 shadow-[0_0_15px_rgba(197,165,114,0.15)]";
      case "CONSIDER ALTERNATIVES":
        return "bg-muted/10 text-muted-foreground border-muted/20 shadow-[0_0_15px_rgba(120,120,120,0.15)]";
      default:
        return "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(74,103,65,0.15)]";
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 md:p-6 bg-background border-accent">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Cilantro Says</h3>
            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">BETA</span>
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </Card>
    );
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
      
      <div className="space-y-6">
        <div 
          className={`inline-block px-4 py-2 rounded-full border ${getVerdictStyles(summary.verdict)} 
            font-semibold text-lg md:text-xl animate-fade-up transition-all duration-300 hover:scale-105`}
        >
          {summary.verdict}
        </div>
        
        <div className="space-y-4">
          {summary.reasons.map((reason, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 animate-fade-up"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              <span className="text-2xl">{reason.emoji}</span>
              <p className="text-muted-foreground leading-tight pt-1">
                {reason.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RestaurantSummary;
