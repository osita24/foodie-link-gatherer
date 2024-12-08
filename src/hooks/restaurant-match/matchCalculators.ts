import { UserPreferences } from "@/types/preferences";
import { RestaurantDetails } from "@/types/restaurant";

export interface MatchResult {
  score: number;
  description: string;
}

export const calculateCuisineMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  console.log('🍽️ Calculating cuisine match:', { restaurantTypes: restaurant.types, userPreferences: preferences.cuisinePreferences });
  
  if (!preferences.cuisinePreferences?.length) {
    return { score: 50, description: "No cuisine preferences set" };
  }

  const restaurantCuisines = restaurant.types?.filter(type => 
    type.toLowerCase().includes('cuisine') || type.toLowerCase().includes('food')
  ) || [];

  const matchCount = restaurantCuisines.filter(cuisine =>
    preferences.cuisinePreferences.some(pref => 
      cuisine.toLowerCase().includes(pref.toLowerCase())
    )
  ).length;

  const score = matchCount > 0 
    ? Math.min(100, 60 + (matchCount * 20))
    : 40;

  return {
    score,
    description: matchCount > 0 
      ? `Matches ${matchCount} of your preferred cuisines`
      : "Different from your preferred cuisines"
  };
};

export const calculateDietaryMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  console.log('🥗 Calculating dietary match:', { restaurantOptions: restaurant, restrictions: preferences.dietaryRestrictions });
  
  if (!preferences.dietaryRestrictions?.length) {
    return { score: 85, description: "No dietary restrictions specified" };
  }

  // Check if restaurant has vegetarian options when user requires them
  const needsVegetarian = preferences.dietaryRestrictions.some(r => 
    r.toLowerCase().includes('vegetarian')
  );
  const hasVegetarian = restaurant.servesVegetarianFood;

  if (needsVegetarian && !hasVegetarian) {
    return {
      score: 30,
      description: "May not accommodate vegetarian diet"
    };
  }

  return {
    score: hasVegetarian ? 95 : 75,
    description: hasVegetarian 
      ? "Offers vegetarian options"
      : "Limited dietary information available"
  };
};

export const calculateAtmosphereMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  console.log('✨ Calculating atmosphere match:', { restaurantAttr: restaurant, preferences: preferences.atmospherePreferences });
  
  if (!preferences.atmospherePreferences?.length) {
    return { score: 50, description: "No atmosphere preferences set" };
  }

  const atmosphereAttributes = [
    restaurant.reservable && 'Fine Dining',
    restaurant.dineIn && 'Casual Dining',
    restaurant.takeout && 'Quick Service',
  ].filter(Boolean);

  const matchCount = atmosphereAttributes.filter(attr =>
    preferences.atmospherePreferences.includes(attr as string)
  ).length;

  const score = matchCount > 0 
    ? Math.min(100, 50 + (matchCount * 25))
    : 40;

  return {
    score,
    description: matchCount > 0
      ? `Matches ${matchCount} of your preferred atmospheres`
      : "Different atmosphere than preferred"
  };
};

export const calculatePriceMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  console.log('💰 Calculating price match:', { restaurantPrice: restaurant.priceLevel, userPreference: preferences.priceRange });
  
  if (!preferences.priceRange) {
    return { score: 50, description: "No price preference set" };
  }

  const priceMap: Record<string, number[]> = {
    'budget': [1],
    'moderate': [1, 2],
    'upscale': [2, 3],
    'luxury': [3, 4]
  };

  const preferredLevels = priceMap[preferences.priceRange];
  const restaurantLevel = restaurant.priceLevel || 2;

  const score = preferredLevels.includes(restaurantLevel) 
    ? 90 
    : Math.max(40, 80 - (Math.abs(restaurantLevel - preferredLevels[0]) * 20));

  return {
    score,
    description: score > 80 
      ? "Matches your preferred price range"
      : "Outside your preferred price range"
  };
};