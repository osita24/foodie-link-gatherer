import { RestaurantDetails } from "@/types/restaurant";
import { UserPreferences } from "@/types/preferences";

export const generateDietaryInsights = (restaurant: RestaurantDetails, preferences: UserPreferences) => {
  const insights: string[] = [];
  
  // Check vegetarian/vegan options
  if (preferences.dietaryRestrictions?.includes("Vegetarian")) {
    if (!restaurant.servesVegetarianFood) {
      insights.push("Limited vegetarian options - most dishes contain meat");
    } else {
      insights.push("Offers dedicated vegetarian menu items");
    }
  }

  if (preferences.dietaryRestrictions?.includes("Vegan")) {
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