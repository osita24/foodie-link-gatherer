import { RestaurantFeatures, UserPreferences } from './types.ts';

export const calculateDietaryMatch = (restaurant: RestaurantFeatures, preferences: UserPreferences): number => {
  if (!preferences.dietary_restrictions?.length) return 85;

  let score = 70;
  const hasVegetarianNeeds = preferences.dietary_restrictions.includes('vegetarian');
  
  if (hasVegetarianNeeds && !restaurant.servesVegetarianFood) {
    return 30; // Major penalty if vegetarian options aren't available
  }

  // Bonus for having appropriate dietary options
  if (hasVegetarianNeeds && restaurant.servesVegetarianFood) {
    score += 30;
  }

  return Math.min(100, score);
};

export const calculateCuisineMatch = (restaurant: RestaurantFeatures, preferences: UserPreferences): number => {
  if (!preferences.cuisine_preferences?.length) return 75;

  const restaurantCuisines = restaurant.types?.filter(type => 
    type.includes('cuisine') || type.includes('food')
  ) || [];

  // Create cuisine groups for similar cuisines
  const cuisineGroups = {
    asian: ['chinese', 'japanese', 'korean', 'thai', 'vietnamese', 'asian'],
    mediterranean: ['greek', 'turkish', 'lebanese', 'mediterranean'],
    european: ['italian', 'french', 'spanish', 'german', 'european'],
    indian: ['indian', 'pakistani', 'bengali', 'south asian'],
    latinAmerican: ['mexican', 'peruvian', 'brazilian', 'argentinian', 'latin'],
    middleEastern: ['lebanese', 'turkish', 'persian', 'middle eastern', 'arab'],
  };

  let maxScore = 0;
  for (const userCuisine of preferences.cuisine_preferences) {
    // Direct match
    if (restaurantCuisines.some(rc => rc.toLowerCase().includes(userCuisine.toLowerCase()))) {
      maxScore = Math.max(maxScore, 100);
      continue;
    }

    // Check for related cuisines
    for (const [group, cuisines] of Object.entries(cuisineGroups)) {
      if (cuisines.includes(userCuisine.toLowerCase()) && 
          restaurantCuisines.some(rc => cuisines.some(c => rc.toLowerCase().includes(c)))) {
        maxScore = Math.max(maxScore, 85); // Related cuisine bonus
      }
    }
  }

  return maxScore || 60;
};

export const calculatePriceMatch = (restaurant: RestaurantFeatures, preferences: UserPreferences): number => {
  if (!preferences.price_range) return 75;

  const priceMap: Record<string, number[]> = {
    'budget': [1],
    'moderate': [1, 2],
    'upscale': [2, 3],
    'luxury': [3, 4]
  };

  const preferredLevels = priceMap[preferences.price_range];
  const restaurantLevel = restaurant.priceLevel || 2;

  if (preferredLevels.includes(restaurantLevel)) {
    return 95;
  }

  // Calculate how far off the price level is
  const minPreferred = Math.min(...preferredLevels);
  const maxPreferred = Math.max(...preferredLevels);
  const distance = Math.min(
    Math.abs(restaurantLevel - minPreferred),
    Math.abs(restaurantLevel - maxPreferred)
  );

  return Math.max(60, 90 - (distance * 15));
};

export const calculateAtmosphereMatch = (restaurant: RestaurantFeatures, preferences: UserPreferences): number => {
  if (!preferences.atmosphere_preferences?.length) return 75;

  let score = 70;
  const features = {
    'Fine Dining': restaurant.reservable,
    'Casual Dining': restaurant.dineIn,
    'Quick Bites': restaurant.takeout,
    'Delivery': restaurant.delivery,
    'Bar Scene': restaurant.servesBeer || restaurant.servesWine
  };

  let matchCount = 0;
  for (const pref of preferences.atmosphere_preferences) {
    if (features[pref as keyof typeof features]) {
      matchCount++;
    }
  }

  return Math.min(100, score + (matchCount * 15));
};