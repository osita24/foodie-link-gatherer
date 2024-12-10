import { RestaurantFeatures, UserPreferences } from "./types.ts";
import { MatchScores, Verdict, VerdictResult } from "./types/verdictTypes.ts";

function generateMustVisitReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];
  
  if (preferences.cuisine_preferences?.length) {
    const matchingCuisine = preferences.cuisine_preferences.find(cuisine => 
      restaurant.types?.some(type => type.toLowerCase().includes(cuisine.toLowerCase()))
    );
    
    if (matchingCuisine) {
      reasons.push({
        emoji: "🎯",
        text: `Perfect match for your ${matchingCuisine.toLowerCase()} cravings - this is exactly what you're looking for!`
      });
    }
  }

  if (preferences.dietary_restrictions?.length) {
    const restriction = preferences.dietary_restrictions[0];
    if (restaurant.servesVegetarianFood) {
      reasons.push({
        emoji: "🥗",
        text: `Excellent ${restriction} options available - they're known for accommodating ${restriction.toLowerCase()} diets perfectly`
      });
    }
  }

  if (preferences.favorite_proteins?.length) {
    const protein = preferences.favorite_proteins[0];
    reasons.push({
      emoji: "🍖",
      text: `They specialize in ${protein.toLowerCase()} dishes, which aligns perfectly with your protein preference`
    });
  }

  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0];
    reasons.push({
      emoji: "✨",
      text: `The ${atmosphere.toLowerCase()} atmosphere matches exactly what you look for in a dining experience`
    });
  }

  if (restaurant.rating && restaurant.rating >= 4.5) {
    reasons.push({
      emoji: "⭐",
      text: `Exceptional ${restaurant.rating}/5 rating from the community - this place consistently delivers outstanding experiences`
    });
  }

  return reasons.slice(0, 3);
}

function generateWorthTryingReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  if (restaurant.rating) {
    reasons.push({
      emoji: "⭐",
      text: `Well-rated at ${restaurant.rating}/5 stars - many diners with similar preferences enjoyed their experience here`
    });
  }

  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0];
    reasons.push({
      emoji: "🍽️",
      text: `While different from your favorite ${preferredCuisine.toLowerCase()} spots, their unique menu offers flavors we think you'll appreciate`
    });
  }

  if (preferences.dietary_restrictions?.length) {
    const restriction = preferences.dietary_restrictions[0];
    reasons.push({
      emoji: "✔️",
      text: `They're experienced in adapting dishes for ${restriction.toLowerCase()} diets - just let your server know`
    });
  }

  if (restaurant.priceLevel && preferences.price_range) {
    const priceContext = restaurant.priceLevel <= 2 ? "budget-friendly" : "premium";
    reasons.push({
      emoji: "💰",
      text: `${priceContext} pricing that aligns well with your usual dining preferences`
    });
  }

  return reasons.slice(0, 3);
}

function generateNotRecommendedReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  if (preferences.dietary_restrictions?.length && !restaurant.servesVegetarianFood) {
    const restriction = preferences.dietary_restrictions[0];
    reasons.push({
      emoji: "🔍",
      text: `Limited options for ${restriction.toLowerCase()} diets - you might find better alternatives elsewhere`
    });
  }

  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0];
    reasons.push({
      emoji: "🍽️",
      text: `Different style from your preferred ${preferredCuisine.toLowerCase()} cuisine - might not match your usual taste`
    });
  }

  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0];
    reasons.push({
      emoji: "🏠",
      text: `The ambiance here differs from your preferred ${atmosphere.toLowerCase()} settings`
    });
  }

  reasons.push({
    emoji: "💡",
    text: `Based on your preferences, we've found other restaurants that might be a better fit`
  });

  return reasons.slice(0, 3);
}

export function generateVerdict(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences,
  scores: MatchScores
): VerdictResult {
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

  return { verdict, reasons };
}