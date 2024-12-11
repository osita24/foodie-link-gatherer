import { RestaurantFeatures, UserPreferences } from "../types.ts";
import { checkDietaryCompatibility, generateDietaryMatchReason } from "./dietaryUtils.ts";

export function generatePositiveReasons(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences
): Array<{ emoji: string; text: string }> {
  const reasons: Array<{ emoji: string; text: string }> = [];

  // Add dietary reason if applicable
  const dietaryReason = generateDietaryMatchReason(restaurant, preferences);
  if (dietaryReason) {
    reasons.push(dietaryReason);
  }

  // Add cuisine match if applicable
  if (preferences.cuisine_preferences?.length) {
    const matchingCuisine = preferences.cuisine_preferences.find(cuisine => 
      restaurant.types?.some(type => type.toLowerCase().includes(cuisine.toLowerCase()))
    );
    
    if (matchingCuisine) {
      reasons.push({
        emoji: "🎯",
        text: `Authentic ${matchingCuisine.toLowerCase()} cuisine that matches your preferences`
      });
    }
  }

  // Add atmosphere reason if applicable
  if (preferences.atmosphere_preferences?.includes('Fine Dining') && restaurant.reservable) {
    reasons.push({
      emoji: "✨",
      text: `Upscale dining experience with carefully curated menu`
    });
  }

  // Add rating reason if applicable
  if (restaurant.rating && restaurant.rating >= 4.5) {
    reasons.push({
      emoji: "⭐",
      text: `Highly rated ${restaurant.rating}/5 by diners`
    });
  }

  // Add fallback positive reasons if we don't have enough
  if (reasons.length < 3) {
    const fallbackReasons = [
      {
        emoji: "🌟",
        text: "Popular destination with diverse menu options"
      },
      {
        emoji: "🏠",
        text: "Welcoming atmosphere for all diners"
      },
      {
        emoji: "✨",
        text: "Known for quality ingredients and preparation"
      }
    ];

    for (const reason of fallbackReasons) {
      if (reasons.length < 3) {
        reasons.push(reason);
      }
    }
  }

  return reasons.slice(0, 3);
}

export function generateNegativeReasons(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences
): Array<{ emoji: string; text: string }> {
  const reasons: Array<{ emoji: string; text: string }> = [];

  // Check dietary compatibility first
  const dietaryCheck = checkDietaryCompatibility(restaurant, preferences);
  if (!dietaryCheck.isCompatible) {
    reasons.push({
      emoji: "⚠️",
      text: dietaryCheck.reason || "May not accommodate your dietary preferences"
    });
  }

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

  // Check for food avoidance conflicts
  if (preferences.favorite_ingredients?.some(item => 
    ["Oily Foods", "Salty Foods"].includes(item)
  )) {
    reasons.push({
      emoji: "🚫",
      text: "Menu items may contain ingredients you prefer to avoid"
    });
  }

  // Add atmosphere mismatch if applicable
  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0];
    if ((atmosphere === 'Fine Dining' && !restaurant.reservable) ||
        (atmosphere === 'Casual Dining' && !restaurant.dineIn)) {
      reasons.push({
        emoji: "🏠",
        text: `Different dining style than your preferred ${atmosphere.toLowerCase()}`
      });
    }
  }

  // Add fallback negative reasons if we don't have enough
  if (reasons.length < 3) {
    const fallbackReasons = [
      {
        emoji: "💭",
        text: "Consider exploring other dining options that better match your preferences"
      },
      {
        emoji: "📝",
        text: "Limited menu information available for dietary assessment"
      },
      {
        emoji: "⚠️",
        text: "May not fully align with your dining preferences"
      }
    ];

    for (const reason of fallbackReasons) {
      if (reasons.length < 3) {
        reasons.push(reason);
      }
    }
  }

  return reasons.slice(0, 3);
}