import { RestaurantFeatures, UserPreferences } from "./types.ts";
import { MatchScores, Verdict, VerdictResult } from "./types/verdictTypes.ts";

function generateMustVisitReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];
  
  // Cuisine match with specific details
  if (preferences.cuisine_preferences?.length) {
    const matchingCuisine = preferences.cuisine_preferences.find(cuisine => 
      restaurant.types?.some(type => type.toLowerCase().includes(cuisine.toLowerCase()))
    );
    
    if (matchingCuisine) {
      reasons.push({
        emoji: "🎯",
        text: `${restaurant.name} specializes in ${matchingCuisine.toLowerCase()} cuisine - exactly what you love!`
      });
    }
  }

  // Dietary preferences with restaurant-specific context
  if (preferences.dietary_restrictions?.length) {
    const restriction = preferences.dietary_restrictions[0];
    if (restaurant.servesVegetarianFood) {
      reasons.push({
        emoji: "🥗",
        text: `They offer a dedicated ${restriction.toLowerCase()} menu with plenty of options like ${restaurant.types?.[0] || 'specialty dishes'}`
      });
    }
  }

  // Protein preferences with specific menu items
  if (preferences.favorite_proteins?.length) {
    const protein = preferences.favorite_proteins[0];
    const cuisineContext = restaurant.types?.[0] ? ` in their ${restaurant.types[0].toLowerCase()} style` : '';
    reasons.push({
      emoji: "🍖",
      text: `Known for their ${protein.toLowerCase()} dishes${cuisineContext}`
    });
  }

  // Atmosphere match with specific details
  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0];
    const ratingContext = restaurant.rating ? ` (${restaurant.rating}/5 stars)` : '';
    reasons.push({
      emoji: "✨",
      text: `Perfect ${atmosphere.toLowerCase()} spot${ratingContext} that matches your preferred dining style`
    });
  }

  return reasons.slice(0, 3);
}

function generateWorthTryingReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  // Rating context with specific numbers
  if (restaurant.rating) {
    reasons.push({
      emoji: "⭐",
      text: `Solid ${restaurant.rating}/5 rating, particularly praised for their ${restaurant.types?.[0] || 'menu'}`
    });
  }

  // Cuisine comparison with specific context
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0];
    const restaurantCuisine = restaurant.types?.[0] || 'unique';
    reasons.push({
      emoji: "🍽️",
      text: `While you usually prefer ${preferredCuisine.toLowerCase()}, ${restaurant.name} offers ${restaurantCuisine.toLowerCase()} flavors worth exploring`
    });
  }

  // Dietary accommodations with specific details
  if (preferences.dietary_restrictions?.length) {
    const restriction = preferences.dietary_restrictions[0];
    reasons.push({
      emoji: "✔️",
      text: `${restaurant.name} can accommodate ${restriction.toLowerCase()} diets - just let them know when ordering`
    });
  }

  return reasons.slice(0, 3);
}

function generateNotRecommendedReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  // Specific dietary limitations
  if (preferences.dietary_restrictions?.length && !restaurant.servesVegetarianFood) {
    const restriction = preferences.dietary_restrictions[0];
    const cuisine = restaurant.types?.[0]?.toLowerCase().replace(/_/g, ' ') || 'traditional';
    reasons.push({
      emoji: "🔍",
      text: `Limited options for ${restriction.toLowerCase()} diets as they primarily serve ${cuisine} dishes`
    });
  }

  // Specific cuisine mismatch
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0].toLowerCase();
    const actualCuisine = restaurant.types?.[0]?.toLowerCase().replace(/_/g, ' ') || 'different';
    if (preferredCuisine !== actualCuisine) {
      reasons.push({
        emoji: "🍽️",
        text: `This restaurant specializes in ${actualCuisine} cuisine, while you typically prefer ${preferredCuisine} restaurants`
      });
    }
  }

  // Specific atmosphere mismatch
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
        text: `You prefer ${atmosphere} dining, while this is more of a ${actualAtmosphere} establishment`
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