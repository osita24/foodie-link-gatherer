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
  if (preferences.atmosphere_preferences?.some(pref => 
    (pref === 'Outdoor Seating' && restaurant.outdoor_seating) ||
    (pref === 'Fine Dining' && restaurant.reservable)
  )) {
    const matchingAtmosphere = preferences.atmosphere_preferences[0];
    reasons.push({
      emoji: "✨",
      text: `Offers ${matchingAtmosphere.toLowerCase()} that you prefer`
    });
  }

  // Add rating reason if applicable
  if (restaurant.rating && restaurant.rating >= 4.5) {
    reasons.push({
      emoji: "⭐",
      text: `Highly rated ${restaurant.rating}/5 by diners`
    });
  }

  // Add price range reason if applicable
  if (preferences.price_range && restaurant.price_level) {
    const priceMatches = (
      (preferences.price_range === 'budget' && restaurant.price_level <= 1) ||
      (preferences.price_range === 'moderate' && restaurant.price_level === 2) ||
      (preferences.price_range === 'upscale' && restaurant.price_level >= 3)
    );
    
    if (priceMatches) {
      reasons.push({
        emoji: "💰",
        text: `Price range matches your ${preferences.price_range} dining preference`
      });
    }
  }

  // Add personalized fallback reasons if we don't have enough
  if (reasons.length < 3) {
    const fallbackReasons = [
      {
        emoji: "🍽️",
        text: preferences.cuisine_preferences?.length 
          ? `Menu includes ${preferences.cuisine_preferences[0].toLowerCase()}-inspired dishes`
          : "Diverse menu options to explore"
      },
      {
        emoji: "🏠",
        text: preferences.atmosphere_preferences?.length
          ? `Atmosphere aligns with your ${preferences.atmosphere_preferences[0].toLowerCase()} preference`
          : "Welcoming dining environment"
      },
      {
        emoji: "🌟",
        text: preferences.dietary_restrictions?.length
          ? `Kitchen can accommodate ${preferences.dietary_restrictions[0].toLowerCase()} dietary needs`
          : "Known for accommodating dietary preferences"
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

  // Check for atmosphere mismatch
  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0];
    const hasAtmosphereMismatch = (
      (atmosphere === 'Outdoor Seating' && !restaurant.outdoor_seating) ||
      (atmosphere === 'Fine Dining' && !restaurant.reservable)
    );
    
    if (hasAtmosphereMismatch) {
      reasons.push({
        emoji: "🏠",
        text: `May not offer your preferred ${atmosphere.toLowerCase()} experience`
      });
    }
  }

  // Check price range mismatch
  if (preferences.price_range && restaurant.price_level) {
    const priceMismatch = (
      (preferences.price_range === 'budget' && restaurant.price_level > 1) ||
      (preferences.price_range === 'moderate' && (restaurant.price_level < 2 || restaurant.price_level > 2)) ||
      (preferences.price_range === 'upscale' && restaurant.price_level < 3)
    );
    
    if (priceMismatch) {
      reasons.push({
        emoji: "💰",
        text: `Price range may not match your ${preferences.price_range} dining preference`
      });
    }
  }

  // Add personalized fallback negative reasons if we don't have enough
  if (reasons.length < 3) {
    const fallbackReasons = [
      {
        emoji: "💭",
        text: preferences.cuisine_preferences?.length
          ? `Limited options for ${preferences.cuisine_preferences[0].toLowerCase()} cuisine lovers`
          : "May not fully align with your dining preferences"
      },
      {
        emoji: "📝",
        text: preferences.dietary_restrictions?.length
          ? `${preferences.dietary_restrictions[0]} options may be limited`
          : "Limited information about dietary accommodations"
      },
      {
        emoji: "⚠️",
        text: preferences.atmosphere_preferences?.length
          ? `Atmosphere may differ from your ${preferences.atmosphere_preferences[0].toLowerCase()} preference`
          : "Consider exploring other dining options"
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