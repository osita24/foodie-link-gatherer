import { RestaurantFeatures, UserPreferences } from "../types.ts";
import { VerdictReason } from "../types/verdictTypes.ts";

export function generateDietaryReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): VerdictReason[] {
  if (!preferences.dietary_restrictions?.length) return [];

  const reasons: VerdictReason[] = [];
  
  if (preferences.dietary_restrictions.includes('Vegetarian')) {
    if (restaurant.servesVegetarianFood) {
      reasons.push({
        emoji: "🥗",
        text: "Offers a dedicated vegetarian menu that suits your dietary needs",
        priority: 1
      });
    } else {
      reasons.push({
        emoji: "⚠️",
        text: `Limited options for your ${preferences.dietary_restrictions.join(" and ")} preferences`,
        priority: 1
      });
    }
  }

  return reasons;
}

export function generateCuisineReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): VerdictReason[] {
  if (!preferences.cuisine_preferences?.length) return [];

  const matchingCuisines = restaurant.types?.filter(type =>
    preferences.cuisine_preferences.some(pref =>
      type.toLowerCase().includes(pref.toLowerCase())
    )
  );

  if (matchingCuisines?.length) {
    return [{
      emoji: "🍽️",
      text: `Specializes in ${matchingCuisines[0].split('_')[0]} cuisine, one of your favorites`,
      priority: 2
    }];
  }

  return [];
}

export function generateAtmosphereReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): VerdictReason[] {
  const reasons: VerdictReason[] = [];

  if (preferences.atmosphere_preferences?.includes('Fine Dining') && restaurant.reservable) {
    reasons.push({
      emoji: "✨",
      text: "Upscale dining atmosphere perfect for special occasions",
      priority: 3
    });
  }

  if (preferences.atmosphere_preferences?.includes('Casual Dining') && restaurant.dineIn) {
    reasons.push({
      emoji: "🪑",
      text: "Relaxed, casual atmosphere ideal for everyday dining",
      priority: 3
    });
  }

  return reasons;
}

export function generatePriceReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): VerdictReason[] {
  if (!preferences.price_range) return [];

  const priceDescriptions = {
    'budget': 'budget-friendly',
    'moderate': 'moderately priced',
    'upscale': 'upscale',
    'luxury': 'high-end'
  };

  const priceMatch = preferences.price_range === 
    (['budget', 'moderate'].includes(preferences.price_range) ? 
      (restaurant.priceLevel <= 2 ? 'match' : 'higher') : 
      (restaurant.priceLevel >= 3 ? 'match' : 'lower'));

  if (priceMatch === 'match') {
    return [{
      emoji: "💰",
      text: `${priceDescriptions[preferences.price_range].charAt(0).toUpperCase() + 
        priceDescriptions[preferences.price_range].slice(1)} pricing that matches your preference`,
      priority: 4
    }];
  }

  return [{
    emoji: "💸",
    text: `${priceMatch === 'higher' ? 'More expensive' : 'More affordable'} than your usual preference`,
    priority: 4
  }];
}