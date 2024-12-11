import { RestaurantFeatures, UserPreferences } from "../types.ts";
import { checkDietaryCompatibility } from "./dietaryUtils.ts";

export function generatePositiveReasons(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences
): Array<{ emoji: string; text: string }> {
  const reasons: Array<{ emoji: string; text: string }> = [];
  const dietaryInsights = preferences.dietaryInsights || [];

  // Add dietary insights first
  if (dietaryInsights.some(insight => insight.includes("dedicated"))) {
    reasons.push({
      emoji: "🥗",
      text: "Offers dedicated menu items matching your dietary preferences"
    });
  }

  // Add cuisine match if applicable
  if (preferences.cuisine_preferences?.length) {
    const matchingCuisine = preferences.cuisine_preferences.find(cuisine => 
      restaurant.types?.some(type => type.toLowerCase().includes(cuisine.toLowerCase()))
    );
    
    if (matchingCuisine) {
      reasons.push({
        emoji: "🎯",
        text: `${matchingCuisine} cuisine aligns with your preferences`
      });
    }
  }

  // Add atmosphere reason if applicable
  if (preferences.atmosphere_preferences?.includes('Fine Dining') && restaurant.reservable) {
    reasons.push({
      emoji: "✨",
      text: "Upscale dining experience with carefully curated menu"
    });
  }

  return reasons.slice(0, 3);
}

export function generateNegativeReasons(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences
): Array<{ emoji: string; text: string }> {
  const reasons: Array<{ emoji: string; text: string }> = [];
  const dietaryInsights = preferences.dietaryInsights || [];

  // Add dietary warnings first
  dietaryInsights.forEach(insight => {
    if (insight.includes("limited") || insight.includes("high in")) {
      reasons.push({
        emoji: "⚠️",
        text: insight
      });
    }
  });

  // Add cuisine mismatch if applicable
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0];
    if (!restaurant.types?.some(type => 
      type.toLowerCase().includes(preferredCuisine.toLowerCase())
    )) {
      reasons.push({
        emoji: "🍽️",
        text: `Different cuisine style than your preferred ${preferredCuisine.toLowerCase()}`
      });
    }
  }

  // Add atmosphere mismatch if applicable
  if (preferences.atmosphere_preferences?.includes('Fine Dining') && !restaurant.reservable) {
    reasons.push({
      emoji: "🏠",
      text: "More casual dining style than your preference"
    });
  }

  return reasons.slice(0, 3);
}