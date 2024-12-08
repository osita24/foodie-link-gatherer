import { UserPreferences } from "@/types/preferences";
import { RestaurantDetails } from "@/types/restaurant";

export interface MatchResult {
  score: number;
  description: string;
}

export const calculateCuisineMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  console.log('🍽️ Calculating cuisine match:', { 
    restaurantTypes: restaurant.types, 
    userPreferences: preferences.cuisinePreferences 
  });
  
  if (!preferences.cuisinePreferences?.length) {
    return { score: 50, description: "No cuisine preferences set" };
  }

  // Convert types to lowercase for better matching
  const restaurantCuisines = restaurant.types?.map(type => type.toLowerCase()) || [];
  const userCuisines = preferences.cuisinePreferences.map(pref => pref.toLowerCase());

  // Count matches between restaurant cuisines and user preferences
  const matches = userCuisines.filter(userCuisine => 
    restaurantCuisines.some(restCuisine => 
      restCuisine.includes(userCuisine) || userCuisine.includes(restCuisine)
    )
  );

  const matchCount = matches.length;
  console.log('Found cuisine matches:', { matchCount, matches });

  const score = matchCount > 0 
    ? Math.min(100, 60 + (matchCount * 20))
    : Math.max(30, 50 - (preferences.cuisinePreferences.length * 10));

  return {
    score,
    description: matchCount > 0 
      ? `Matches ${matchCount} of your preferred cuisines`
      : "Different from your preferred cuisines"
  };
};

export const calculateDietaryMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  console.log('🥗 Calculating dietary match:', { 
    restaurantFeatures: {
      vegetarian: restaurant.servesVegetarianFood,
    },
    restrictions: preferences.dietaryRestrictions 
  });
  
  if (!preferences.dietaryRestrictions?.length) {
    return { score: 85, description: "No dietary restrictions specified" };
  }

  const dietaryScore = preferences.dietaryRestrictions.reduce((score, restriction) => {
    const restrictionLower = restriction.toLowerCase();
    
    // Check vegetarian requirements
    if (restrictionLower.includes('vegetarian')) {
      return restaurant.servesVegetarianFood ? score + 40 : score - 30;
    }
    
    // Check if restaurant explicitly mentions accommodating the restriction
    if (restaurant.types?.some(type => type.toLowerCase().includes(restrictionLower))) {
      return score + 30;
    }

    return score;
  }, 50);

  const finalScore = Math.max(0, Math.min(100, dietaryScore));

  return {
    score: finalScore,
    description: finalScore > 70 
      ? "Likely accommodates your dietary needs"
      : finalScore > 40 
        ? "May accommodate some dietary restrictions"
        : "May not accommodate all dietary restrictions"
  };
};

export const calculateAtmosphereMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  console.log('✨ Calculating atmosphere match:', { 
    restaurantFeatures: {
      reservable: restaurant.reservable,
      dineIn: restaurant.dineIn,
      takeout: restaurant.takeout,
    }, 
    preferences: preferences.atmospherePreferences 
  });
  
  if (!preferences.atmospherePreferences?.length) {
    return { score: 50, description: "No atmosphere preferences set" };
  }

  let score = 50;
  const matchedFeatures: string[] = [];

  // Map restaurant features to atmosphere types
  if (restaurant.reservable && preferences.atmospherePreferences.includes('Fine Dining')) {
    score += 25;
    matchedFeatures.push('Fine Dining');
  }

  if (restaurant.dineIn && preferences.atmospherePreferences.includes('Casual Dining')) {
    score += 25;
    matchedFeatures.push('Casual Dining');
  }

  if (restaurant.takeout && preferences.atmospherePreferences.includes('Quick Service')) {
    score += 25;
    matchedFeatures.push('Quick Service');
  }

  // Adjust score based on price level for atmosphere correlation
  if (restaurant.priceLevel >= 3 && preferences.atmospherePreferences.includes('Fine Dining')) {
    score += 15;
  }

  const finalScore = Math.min(100, score);

  return {
    score: finalScore,
    description: matchedFeatures.length > 0
      ? `Matches your preferred atmosphere: ${matchedFeatures.join(', ')}`
      : "Different atmosphere than preferred"
  };
};

export const calculatePriceMatch = (restaurant: RestaurantDetails, preferences: UserPreferences): MatchResult => {
  console.log('💰 Calculating price match:', { 
    restaurantPrice: restaurant.priceLevel, 
    userPreference: preferences.priceRange 
  });
  
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

  // Calculate how far the restaurant's price level is from preferred range
  const minDistance = Math.min(...preferredLevels.map(level => Math.abs(level - restaurantLevel)));
  
  const score = minDistance === 0 
    ? 100 
    : minDistance === 1 
      ? 70 
      : Math.max(30, 80 - (minDistance * 25));

  return {
    score,
    description: score > 80 
      ? "Matches your preferred price range"
      : score > 60
        ? "Slightly outside your preferred price range"
        : "Outside your preferred price range"
  };
};