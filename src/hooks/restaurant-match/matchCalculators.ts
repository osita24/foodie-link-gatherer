import { RestaurantFeatures, UserPreferences } from "./types.ts";

export function calculateDietaryScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  console.log("🥗 Calculating enhanced dietary score for:", restaurant.name);
  console.log("👤 User dietary preferences:", preferences.dietary_restrictions);

  let score = 75; // Start with a neutral score

  // Critical dietary restrictions check with enhanced validation
  if (preferences.dietary_restrictions?.length) {
    // Vegetarian/Vegan checks with stricter validation
    if (preferences.dietary_restrictions.includes('Vegetarian') || 
        preferences.dietary_restrictions.includes('Vegan')) {
      if (!restaurant.servesVegetarianFood) {
        console.log("❌ Restaurant doesn't serve vegetarian food");
        return 0; // Complete rejection for dietary incompatibility
      }
      score += 25; // Bonus for confirmed vegetarian options
    }

    // Enhanced dietary restriction checking
    const hasConflictingTypes = restaurant.types?.some(type => {
      const lowerType = type.toLowerCase();
      return (
        (preferences.dietary_restrictions.includes('Gluten-Free') && 
         (lowerType.includes('pasta') || lowerType.includes('pizza') || 
          lowerType.includes('bakery') || lowerType.includes('brewery'))) ||
        (preferences.dietary_restrictions.includes('Dairy-Free') && 
         (lowerType.includes('cheese') || lowerType.includes('ice cream') || 
          lowerType.includes('creamery'))) ||
        (preferences.dietary_restrictions.includes('High Sodium') &&
         (lowerType.includes('fast food') || lowerType.includes('chinese') || 
          lowerType.includes('korean') || lowerType.includes('bbq')))
      );
    });

    if (hasConflictingTypes) {
      console.log("⚠️ Restaurant type conflicts with dietary restrictions");
      score -= 50; // Increased penalty for dietary conflicts
    }
  }

  console.log("📊 Final dietary score:", Math.min(100, Math.max(0, score)));
  return Math.min(100, Math.max(0, score));
}

export function calculateCuisineScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  console.log("🍽️ Calculating enhanced cuisine score for:", restaurant.name);
  console.log("👤 User cuisine preferences:", preferences.cuisine_preferences);

  if (!preferences.cuisine_preferences?.length) return 75;

  const restaurantCuisines = restaurant.types?.filter(type => 
    type.includes('cuisine') || type.includes('food')
  ) || [];

  const matchCount = restaurantCuisines.filter(cuisine =>
    preferences.cuisine_preferences.some(pref => 
      cuisine.toLowerCase().includes(pref.toLowerCase())
    )
  ).length;

  // Enhanced scoring system for cuisine matches
  const score = matchCount > 0 ? Math.min(100, 70 + (matchCount * 20)) : 60;
  console.log("📊 Enhanced cuisine match count:", matchCount, "Score:", score);
  return score;
}

export function calculateProteinScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  console.log("🥩 Calculating enhanced protein score for:", restaurant.name);
  
  if (preferences.dietary_restrictions?.includes('Vegetarian') || 
      preferences.dietary_restrictions?.includes('Vegan')) {
    console.log("🌱 User is vegetarian/vegan - skipping protein score");
    return 85; // Higher base score for vegetarian/vegan preferences
  }

  if (!preferences.favorite_proteins?.length || 
      preferences.favorite_proteins.includes("Doesn't Apply")) {
    return 75;
  }

  // Enhanced protein matching with more specific categories
  const proteinMatches = {
    'Beef': ['steakhouse', 'burger', 'bbq', 'brazilian', 'argentine'],
    'Chicken': ['chicken', 'poultry', 'wings', 'soul food', 'southern'],
    'Fish': ['seafood', 'fish', 'sushi', 'poke', 'mediterranean'],
    'Pork': ['bbq', 'pork', 'korean', 'german', 'chinese'],
    'Lamb': ['mediterranean', 'greek', 'indian', 'middle eastern', 'turkish'],
    'Tofu': ['vegetarian', 'asian', 'chinese', 'japanese', 'korean'],
    'Turkey': ['sandwich', 'deli', 'american', 'thanksgiving'],
  };

  const matchCount = preferences.favorite_proteins.filter(protein =>
    restaurant.types?.some(type =>
      proteinMatches[protein]?.some(keyword =>
        type.toLowerCase().includes(keyword)
      )
    )
  ).length;

  // Enhanced scoring system for protein matches
  const score = matchCount > 0 ? Math.min(100, 70 + (matchCount * 20)) : 60;
  console.log("📊 Enhanced protein match count:", matchCount, "Score:", score);
  return score;
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

  // Enhanced price matching with more nuanced scoring
  const score = preferredLevels.includes(restaurantLevel) ? 95 : 
    Math.abs(restaurantLevel - preferredLevels[0]) === 1 ? 70 : 50;

  return score;
}

export function calculateAtmosphereScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  if (!preferences.atmosphere_preferences?.length) return 75;

  // Enhanced atmosphere matching with more specific features
  const features = {
    'Fine Dining': restaurant.reservable && restaurant.priceLevel >= 3,
    'Casual Dining': restaurant.dineIn && (restaurant.priceLevel === 2 || restaurant.priceLevel === 1),
    'Quick Bites': restaurant.takeout && restaurant.priceLevel === 1,
    'Delivery': restaurant.delivery,
    'Bar Scene': restaurant.servesBeer || restaurant.servesWine,
    'Family Friendly': restaurant.dineIn && !restaurant.servesBeer && !restaurant.servesWine,
    'Outdoor Seating': restaurant.hasOutdoorSeating,
  };

  const matchCount = preferences.atmosphere_preferences.filter(pref => features[pref]).length;
  // Enhanced scoring system for atmosphere matches
  return Math.min(100, 70 + (matchCount * 15));
}