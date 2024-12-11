import { UserPreferences } from "@/types/preferences";
import { RestaurantDetails } from "@/types/restaurant";

export interface MatchResult {
  score: number;
  description: string;
}

export const calculateCuisineMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  if (!preferences.cuisinePreferences?.length) {
    return { score: 85, description: "Based on popular cuisine type" };
  }

  const restaurantCuisines = restaurant.types?.filter(type => 
    type.includes('cuisine') || type.includes('food')
  ) || [];

  const matchCount = restaurantCuisines.filter(cuisine =>
    preferences.cuisinePreferences.some(pref => 
      cuisine.toLowerCase().includes(pref.toLowerCase())
    )
  ).length;

  const score = matchCount > 0 
    ? Math.min(100, 70 + (matchCount * 10))
    : 70;

  return {
    score,
    description: matchCount > 0 
      ? `Matches ${matchCount} of your preferred cuisines`
      : "Popular cuisine type that you might enjoy"
  };
};

export const calculateDietaryMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  if (!preferences.dietaryRestrictions?.length) {
    return { score: 90, description: "No dietary restrictions specified" };
  }

  const hasVegetarian = restaurant.servesVegetarianFood;
  const score = hasVegetarian ? 95 : 75;

  return {
    score,
    description: hasVegetarian 
      ? "Offers vegetarian options"
      : "Limited information about dietary options"
  };
};

export const calculateAtmosphereMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  if (!preferences.atmospherePreferences?.length) {
    return { score: 85, description: "Based on general atmosphere" };
  }

  const atmosphereAttributes = [
    restaurant.reservable && 'Fine Dining',
    restaurant.dineIn && 'Casual Dining',
  ].filter(Boolean);

  const matchCount = atmosphereAttributes.filter(attr =>
    preferences.atmospherePreferences.includes(attr as string)
  ).length;

  const score = matchCount > 0 
    ? Math.min(100, 75 + (matchCount * 10))
    : 75;

  return {
    score,
    description: matchCount > 0
      ? `Matches ${matchCount} of your preferred atmosphere types`
      : "General atmosphere rating"
  };
};

export const calculatePriceMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  if (!preferences.priceRange) {
    return { score: 85, description: "Based on average pricing" };
  }

  const priceMap: Record<string, number[]> = {
    'budget': [1],
    'moderate': [1, 2],
    'upscale': [2, 3],
    'luxury': [3, 4]
  };

  const preferredLevels = priceMap[preferences.priceRange];
  const restaurantLevel = restaurant.priceLevel || 2;

  const score = preferredLevels.includes(restaurantLevel) ? 95 : 75;

  return {
    score,
    description: score > 90 
      ? "Matches your preferred price range"
      : "Slightly outside your preferred price range"
  };
};