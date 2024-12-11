import { RestaurantFeatures, UserPreferences } from "../types.ts";
import { checkDietaryCompatibility, generateDietaryMatchReason } from "./dietaryUtils.ts";

export function generatePositiveReasons(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences
): Array<{ emoji: string; text: string }> {
  const reasons: Array<{ emoji: string; text: string }> = [];

  // Check dietary compatibility first
  const dietaryCheck = checkDietaryCompatibility(restaurant, preferences);
  if (!dietaryCheck.isCompatible) {
    return reasons;
  }

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

  // Add vegetarian/vegan reason if applicable
  if (preferences.dietary_restrictions?.includes("Vegetarian") && restaurant.servesVegetarianFood) {
    reasons.push({
      emoji: "🥗",
      text: "Offers dedicated vegetarian options"
    });
  }

  // Add sodium preference reason if applicable
  if (preferences.favorite_ingredients?.includes("High Sodium")) {
    reasons.push({
      emoji: "🧂",
      text: "We'll help you identify lower-sodium options on the menu"
    });
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
    return reasons;
  }

  // Add vegetarian/vegan warning if applicable
  if (preferences.dietary_restrictions?.includes("Vegetarian") && !restaurant.servesVegetarianFood) {
    reasons.push({
      emoji: "🥗",
      text: "Limited vegetarian options available"
    });
  }

  // Add cuisine mismatch if applicable
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0];
    const restaurantCuisine = restaurant.types?.[0]?.toLowerCase().replace(/_/g, ' ') || 'different';
    if (preferredCuisine.toLowerCase() !== restaurantCuisine) {
      reasons.push({
        emoji: "🍽️",
        text: `Different cuisine style than your preferred ${preferredCuisine.toLowerCase()}`
      });
    }
  }

  // Add sodium warning if applicable
  if (preferences.favorite_ingredients?.includes("High Sodium") && 
      restaurant.types?.some(type => ['fast_food', 'chinese', 'korean'].includes(type.toLowerCase()))) {
    reasons.push({
      emoji: "🧂",
      text: "Many dishes at this restaurant may be high in sodium"
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

  return reasons.slice(0, 3);
}