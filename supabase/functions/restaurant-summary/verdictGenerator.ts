import { RestaurantFeatures, UserPreferences } from "./types.ts";
import { MatchScores, Verdict, VerdictResult } from "./types/verdictTypes.ts";

function generateMustVisitReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];
  
  // Menu and dietary compatibility
  if (restaurant.servesVegetarianFood && preferences.dietary_restrictions?.includes('Vegetarian')) {
    reasons.push({
      emoji: "🥗",
      text: `Extensive vegetarian menu with plenty of options that match your dietary preferences`
    });
  }

  // Protein preferences with specific menu items
  if (preferences.favorite_proteins?.length && preferences.favorite_proteins[0] !== "Doesn't Apply") {
    const protein = preferences.favorite_proteins[0];
    if (restaurant.types?.some(type => 
      type.toLowerCase().includes(protein.toLowerCase()) ||
      type.toLowerCase().includes('steakhouse') ||
      type.toLowerCase().includes('seafood')
    )) {
      reasons.push({
        emoji: "🍖",
        text: `Known for their ${protein.toLowerCase()} dishes and specialties`
      });
    }
  }

  // Cuisine match with specific details
  if (preferences.cuisine_preferences?.length) {
    const matchingCuisine = preferences.cuisine_preferences.find(cuisine => 
      restaurant.types?.some(type => type.toLowerCase().includes(cuisine.toLowerCase()))
    );
    
    if (matchingCuisine) {
      reasons.push({
        emoji: "🎯",
        text: `Authentic ${matchingCuisine.toLowerCase()} cuisine that aligns perfectly with your taste preferences`
      });
    }
  }

  // Special considerations and atmosphere
  if (preferences.atmosphere_preferences?.includes('Fine Dining') && restaurant.reservable) {
    reasons.push({
      emoji: "✨",
      text: `Upscale dining experience with carefully crafted menu selections`
    });
  } else if (preferences.atmosphere_preferences?.includes('Casual Dining') && restaurant.dineIn) {
    reasons.push({
      emoji: "🪑",
      text: `Relaxed atmosphere with a diverse menu perfect for everyday dining`
    });
  }

  return reasons.slice(0, 3);
}

function generateWorthTryingReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  // Menu variety and options
  if (restaurant.servesVegetarianFood) {
    reasons.push({
      emoji: "🥗",
      text: `Good selection of vegetarian options alongside their regular menu`
    });
  }

  // Special menu features
  if (restaurant.servesBreakfast && restaurant.servesLunch && restaurant.servesDinner) {
    reasons.push({
      emoji: "🍳",
      text: `All-day dining with varied menu options for breakfast, lunch, and dinner`
    });
  }

  // Cuisine exploration opportunity
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0];
    const restaurantCuisine = restaurant.types?.[0]?.toLowerCase().replace(/_/g, ' ') || 'unique';
    if (preferredCuisine.toLowerCase() !== restaurantCuisine) {
      reasons.push({
        emoji: "🍽️",
        text: `A chance to explore ${restaurantCuisine} flavors with dishes that complement your taste preferences`
      });
    }
  }

  // Rating context with menu highlights
  if (restaurant.rating && restaurant.rating >= 4) {
    reasons.push({
      emoji: "⭐",
      text: `Well-rated ${restaurant.rating}/5 for their menu quality and consistency`
    });
  }

  return reasons.slice(0, 3);
}

function generateNotRecommendedReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  // Menu limitations for dietary preferences
  if (preferences.dietary_restrictions?.length && !restaurant.servesVegetarianFood) {
    const restriction = preferences.dietary_restrictions[0];
    reasons.push({
      emoji: "⚠️",
      text: `Limited ${restriction.toLowerCase()} options on their main menu`
    });
  }

  // Protein preference mismatch
  if (preferences.favorite_proteins?.length && preferences.favorite_proteins[0] !== "Doesn't Apply") {
    const protein = preferences.favorite_proteins[0];
    const proteinFocused = restaurant.types?.some(type => 
      type.toLowerCase().includes(protein.toLowerCase()) ||
      type.toLowerCase().includes('steakhouse') ||
      type.toLowerCase().includes('seafood')
    );
    
    if (!proteinFocused) {
      reasons.push({
        emoji: "🍽️",
        text: `Menu doesn't focus on ${protein.toLowerCase()}, which is one of your preferred proteins`
      });
    }
  }

  // Cuisine style mismatch
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0].toLowerCase();
    const actualCuisine = restaurant.types?.[0]?.toLowerCase().replace(/_/g, ' ') || 'different';
    if (preferredCuisine !== actualCuisine) {
      reasons.push({
        emoji: "🌍",
        text: `Menu focuses on ${actualCuisine} dishes, which differ from your preferred ${preferredCuisine} cuisine`
      });
    }
  }

  // Dining style mismatch
  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0].toLowerCase();
    const actualAtmosphere = restaurant.types?.find(t => 
      t.toLowerCase().includes('casual') || 
      t.toLowerCase().includes('fine') || 
      t.toLowerCase().includes('fast')
    )?.toLowerCase().replace(/_/g, ' ') || 'different';
    
    if (atmosphere !== actualAtmosphere) {
      reasons.push({
        emoji: "🏠",
        text: `${actualAtmosphere.charAt(0).toUpperCase() + actualAtmosphere.slice(1)} menu style differs from your preferred ${atmosphere} dining experience`
      });
    }
  }

  return reasons.slice(0, 3);
}

export function generateVerdict(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences,
  scores: MatchScores
): VerdictResult {
  console.log("🎯 Generating verdict for:", restaurant.name);
  console.log("📊 Match scores:", scores);

  const weightedScore = (
    (scores.dietaryScore * 0.35) +
    (scores.cuisineScore * 0.25) +
    (scores.proteinScore * 0.20) +
    (scores.atmosphereScore * 0.10) +
    (scores.priceScore * 0.10)
  );

  const hasDietaryRestrictions = preferences.dietary_restrictions?.length > 0;
  const meetsRestrictions = scores.dietaryScore >= 70;

  let verdict: Verdict;
  let reasons: Array<{ emoji: string; text: string }>;

  if (hasDietaryRestrictions && !meetsRestrictions) {
    verdict = "CONSIDER ALTERNATIVES";
    reasons = generateNotRecommendedReasons(restaurant, preferences);
  } else if (weightedScore >= 85) {
    verdict = "PERFECT MATCH";
    reasons = generateMustVisitReasons(restaurant, preferences);
  } else if (weightedScore >= 65) {
    verdict = "WORTH EXPLORING";
    reasons = generateWorthTryingReasons(restaurant, preferences);
  } else {
    verdict = "CONSIDER ALTERNATIVES";
    reasons = generateNotRecommendedReasons(restaurant, preferences);
  }

  console.log("✨ Generated verdict:", verdict);
  console.log("📝 Generated reasons:", reasons);

  return { verdict, reasons };
}