import { RestaurantFeatures, UserPreferences, MatchScores } from "./types.ts";

export function calculateDietaryScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  let score = 70;

  if (preferences.dietary_restrictions?.includes('Vegetarian')) {
    if (restaurant.servesVegetarianFood) {
      score += 30;
    } else {
      score -= 40;
    }
  }

  return Math.min(100, Math.max(0, score));
}

export function calculateCuisineScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  if (!preferences.cuisine_preferences?.length) return 75;

  const restaurantCuisines = restaurant.types?.filter(type => 
    type.includes('cuisine') || type.includes('food')
  ) || [];

  const matchCount = restaurantCuisines.filter(cuisine =>
    preferences.cuisine_preferences.some(pref => 
      cuisine.toLowerCase().includes(pref.toLowerCase())
    )
  ).length;

  return matchCount > 0 ? Math.min(100, 70 + (matchCount * 15)) : 60;
}

export function calculateProteinScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  if (!preferences.favorite_proteins?.length || preferences.favorite_proteins.includes("Doesn't Apply")) {
    return 75;
  }

  const proteinMatches = {
    'Beef': ['steakhouse', 'burger'],
    'Chicken': ['chicken', 'poultry'],
    'Fish': ['seafood', 'fish'],
    'Pork': ['bbq', 'pork'],
    'Lamb': ['mediterranean', 'greek'],
    'Tofu': ['vegetarian', 'asian'],
  };

  const matchCount = preferences.favorite_proteins.filter(protein =>
    restaurant.types?.some(type =>
      proteinMatches[protein]?.some(keyword =>
        type.toLowerCase().includes(keyword)
      )
    )
  ).length;

  return matchCount > 0 ? Math.min(100, 70 + (matchCount * 15)) : 60;
}

export function calculatePriceScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  if (!preferences.price_range) return 75;

  const priceMap: Record<string, number[]> = {
    'budget': [1],
    'moderate': [1, 2],
    'upscale': [2, 3],
    'luxury': [3, 4]
  };

  const preferredLevels = priceMap[preferences.price_range];
  const restaurantLevel = restaurant.priceLevel || 2;

  return preferredLevels.includes(restaurantLevel) ? 95 : 60;
}

export function calculateAtmosphereScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  if (!preferences.atmosphere_preferences?.length) return 75;

  const features = {
    'Fine Dining': restaurant.reservable,
    'Casual Dining': restaurant.dineIn,
    'Quick Bites': restaurant.takeout,
    'Delivery': restaurant.delivery,
    'Bar Scene': restaurant.servesBeer || restaurant.servesWine
  };

  const matchCount = preferences.atmosphere_preferences.filter(pref => features[pref]).length;
  return Math.min(100, 70 + (matchCount * 15));
}