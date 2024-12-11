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

    // For vegetarian/vegan restaurants, provide more nuanced feedback
    if (['Vegetarian', 'Vegan'].includes(restriction)) {
      const hasVegetarianOptions = restaurant.servesVegetarianFood;
      const isStrictlyVegetarian = restaurant.types?.some(type => 
        type.toLowerCase().includes('vegetarian') || 
        type.toLowerCase().includes('vegan')
      );
      
      if (!hasVegetarianOptions && !isStrictlyVegetarian) {
        return {
          isCompatible: false,
          reason: `Limited ${restriction.toLowerCase()} options available - you may want to call ahead to confirm dietary accommodations`
        };
      }
      
      if (hasVegetarianOptions) {
        return { 
          isCompatible: true,
          reason: isStrictlyVegetarian 
            ? `Specializes in ${restriction.toLowerCase()} cuisine`
            : `Offers dedicated ${restriction.toLowerCase()} menu options`
        };
      }
    }

    // For other dietary restrictions, check type compatibility
    if (hasIncompatibleType) {
      return {
        isCompatible: false,
        reason: `This restaurant specializes in cuisine that may not align with your ${restriction.toLowerCase()} preferences - call ahead to discuss options`
      };
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
  
  if (['Vegetarian', 'Vegan'].includes(restriction)) {
    const isStrictlyVegetarian = restaurant.types?.some(type => 
      type.toLowerCase().includes('vegetarian') || 
      type.toLowerCase().includes('vegan')
    );

    if (restaurant.servesVegetarianFood) {
      return {
        emoji: "🥗",
        text: isStrictlyVegetarian
          ? `Dedicated ${restriction.toLowerCase()} restaurant`
          : `Offers ${restriction.toLowerCase()} menu options`
      };
    }
  }

  return null;
}