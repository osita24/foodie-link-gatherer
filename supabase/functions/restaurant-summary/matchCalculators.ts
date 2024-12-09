import { RestaurantFeatures, UserPreferences } from "./types.ts";

export function calculateDietaryScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  console.log("🥗 Calculating dietary score for:", restaurant.name);
  console.log("👤 User dietary preferences:", preferences.dietary_restrictions);

  // Start with neutral score
  let score = 70;

  // Critical dietary restrictions check
  if (preferences.dietary_restrictions?.length) {
    // Vegetarian/Vegan checks
    if (preferences.dietary_restrictions.includes('Vegetarian') || 
        preferences.dietary_restrictions.includes('Vegan')) {
      if (!restaurant.servesVegetarianFood) {
        console.log("❌ Restaurant doesn't serve vegetarian food");
        return 0; // Complete rejection
      }
      score += 30;
    }

    // Other dietary restrictions
    const hasConflictingTypes = restaurant.types?.some(type => {
      const lowerType = type.toLowerCase();
      return (
        (preferences.dietary_restrictions.includes('Gluten-Free') && 
         (lowerType.includes('pasta') || lowerType.includes('pizza') || lowerType.includes('bakery'))) ||
        (preferences.dietary_restrictions.includes('Dairy-Free') && 
         (lowerType.includes('cheese') || lowerType.includes('ice cream')))
      );
    });

    if (hasConflictingTypes) {
      console.log("⚠️ Restaurant type conflicts with dietary restrictions");
      score -= 40;
    }
  }

  console.log("📊 Final dietary score:", Math.min(100, Math.max(0, score)));
  return Math.min(100, Math.max(0, score));
}

export function calculateCuisineScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  console.log("🍽️ Calculating cuisine score for:", restaurant.name);
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

  const score = matchCount > 0 ? Math.min(100, 70 + (matchCount * 15)) : 60;
  console.log("📊 Cuisine match count:", matchCount, "Score:", score);
  return score;
}

export function calculateProteinScore(restaurant: RestaurantFeatures, preferences: UserPreferences): number {
  console.log("🥩 Calculating protein score for:", restaurant.name);
  
  // Skip protein scoring for vegetarian/vegan users
  if (preferences.dietary_restrictions?.includes('Vegetarian') || 
      preferences.dietary_restrictions?.includes('Vegan')) {
    console.log("🌱 User is vegetarian/vegan - skipping protein score");
    return 75;
  }

  if (!preferences.favorite_proteins?.length || 
      preferences.favorite_proteins.includes("Doesn't Apply")) {
    return 75;
  }

  const proteinMatches = {
    'Beef': ['steakhouse', 'burger', 'bbq'],
    'Chicken': ['chicken', 'poultry', 'wings'],
    'Fish': ['seafood', 'fish', 'sushi'],
    'Pork': ['bbq', 'pork', 'korean'],
    'Lamb': ['mediterranean', 'greek', 'indian'],
    'Tofu': ['vegetarian', 'asian', 'chinese'],
    'Turkey': ['sandwich', 'deli', 'american'],
  };

  const matchCount = preferences.favorite_proteins.filter(protein =>
    restaurant.types?.some(type =>
      proteinMatches[protein]?.some(keyword =>
        type.toLowerCase().includes(keyword)
      )
    )
  ).length;

  const score = matchCount > 0 ? Math.min(100, 70 + (matchCount * 15)) : 60;
  console.log("📊 Protein match count:", matchCount, "Score:", score);
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
