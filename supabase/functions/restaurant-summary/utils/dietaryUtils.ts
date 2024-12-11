import { RestaurantFeatures, UserPreferences } from "../types.ts";
import { DIETARY_RESTRICTIONS } from "../types/dietaryTypes.ts";

export function checkDietaryCompatibility(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences
): { isCompatible: boolean; reason?: string } {
  if (!preferences.dietary_restrictions?.length) {
    return { isCompatible: true };
  }

  for (const restriction of preferences.dietary_restrictions) {
    const dietaryRule = DIETARY_RESTRICTIONS[restriction];
    if (!dietaryRule) continue;

    // Check restaurant type compatibility
    const hasIncompatibleType = restaurant.types?.some(type =>
      dietaryRule.forbiddenTypes.some(forbidden =>
        type.toLowerCase().includes(forbidden.toLowerCase())
      )
    );

    if (hasIncompatibleType) {
      return {
        isCompatible: false,
        reason: `This restaurant specializes in dishes that don't align with your ${restriction.toLowerCase()} preferences`
      };
    }

    // For vegetarian/vegan restaurants, check if they explicitly cater to these diets
    if (['Vegetarian', 'Vegan'].includes(restriction)) {
      const isVegetarianFriendly = restaurant.servesVegetarianFood;
      
      if (!isVegetarianFriendly) {
        return {
          isCompatible: false,
          reason: `This restaurant doesn't have a dedicated ${restriction.toLowerCase()} menu`
        };
      }
    }
  }

  return { isCompatible: true };
}

export function generateDietaryMatchReason(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences
): { emoji: string; text: string } | null {
  if (!preferences.dietary_restrictions?.length) {
    return null;
  }

  const restriction = preferences.dietary_restrictions[0];
  
  if (['Vegetarian', 'Vegan'].includes(restriction) && restaurant.servesVegetarianFood) {
    return {
      emoji: "🥗",
      text: `Dedicated ${restriction.toLowerCase()} menu available`
    };
  }

  return null;
}