import { supabase } from "@/integrations/supabase/client";
import { RestaurantDetails } from "@/types/restaurant";
import { UserPreferences } from "@/types/preferences";

interface InsightResponse {
  matchScore: number;
  reasons: string[];
}

export async function generateRestaurantInsights(
  restaurant: RestaurantDetails,
  preferences: UserPreferences
): Promise<InsightResponse> {
  console.log("🤖 Generating restaurant insights...");
  
  try {
    const { data: insights, error } = await supabase.functions.invoke('restaurant-insights', {
      body: { 
        restaurant,
        preferences
      }
    });

    if (error) {
      console.error("❌ Error generating insights:", error);
      throw error;
    }

    console.log("✨ Generated insights:", insights);
    return insights;
  } catch (error) {
    console.error("❌ Failed to generate insights:", error);
    return {
      matchScore: 50,
      reasons: [
        "We're having trouble analyzing this restaurant right now",
        "Please try again later",
        "Our AI is taking a quick break"
      ]
    };
  }
}