import { RestaurantFeatures, UserPreferences } from "./types.ts";
import { MatchScores, Verdict, VerdictResult } from "./types/verdictTypes.ts";

function generateMustVisitReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];
  
  // Add highly personalized cuisine match
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

  // Add detailed dietary compatibility
  if (preferences.dietary_restrictions?.length) {
    const restriction = preferences.dietary_restrictions[0];
    if (restaurant.servesVegetarianFood) {
      reasons.push({
        emoji: "🥗",
        text: `Excellent ${restriction} options available - they're known for accommodating ${restriction.toLowerCase()} diets perfectly`
      });
    }
  }

  // Add protein preference insights
  if (preferences.favorite_proteins?.length) {
    const protein = preferences.favorite_proteins[0];
    reasons.push({
      emoji: "🍖",
      text: `They specialize in ${protein.toLowerCase()} dishes, which aligns perfectly with your protein preference`
    });
  }

  // Add atmosphere insights
  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0];
    reasons.push({
      emoji: "✨",
      text: `The ${atmosphere.toLowerCase()} atmosphere matches exactly what you look for in a dining experience`
    });
  }

  // Add rating context if exceptional
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

  // Add personalized rating context
  if (restaurant.rating) {
    reasons.push({
      emoji: "⭐",
      text: `Well-rated at ${restaurant.rating}/5 stars - many diners with similar preferences enjoyed their experience here`
    });
  }

  // Add detailed cuisine context
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0];
    reasons.push({
      emoji: "🍽️",
      text: `While different from your favorite ${preferredCuisine.toLowerCase()} spots, their unique menu offers flavors we think you'll appreciate`
    });
  }

  // Add specific dietary insights
  if (preferences.dietary_restrictions?.length) {
    const restriction = preferences.dietary_restrictions[0];
    reasons.push({
      emoji: "✔️",
      text: `They're experienced in adapting dishes for ${restriction.toLowerCase()} diets - just let your server know`
    });
  }

  // Add detailed price context
  if (restaurant.priceLevel && preferences.price_range) {
    const priceContext = restaurant.priceLevel <= 2 ? "budget-friendly" : "premium";
    reasons.push({
      emoji: "💰",
      text: `${priceContext} pricing that aligns well with your usual dining preferences`
    });
  }

  return reasons.slice(0, 3);
}

function generateSkipItReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  // Add specific dietary warning
  if (preferences.dietary_restrictions?.length && !restaurant.servesVegetarianFood) {
    const restriction = preferences.dietary_restrictions[0];
    reasons.push({
      emoji: "⚠️",
      text: `Limited options for your ${restriction.toLowerCase()} requirements - we found better alternatives for your dietary needs`
    });
  }

  // Add detailed cuisine mismatch explanation
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0];
    reasons.push({
      emoji: "🍽️",
      text: `This differs significantly from your preferred ${preferredCuisine.toLowerCase()} cuisine style - we can suggest better matches`
    });
  }

  // Add specific atmosphere mismatch
  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0];
    reasons.push({
      emoji: "🏠",
      text: `The ambiance here doesn't match your preference for ${atmosphere.toLowerCase()} settings`
    });
  }

  // Add personalized alternative suggestion
  reasons.push({
    emoji: "💡",
    text: `Based on your taste profile, we've found several restaurants that would better match your preferences`
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
    verdict = "SKIP IT";
    reasons = generateSkipItReasons(restaurant, preferences);
  } else if (weightedScore >= 85) {
    verdict = "MUST VISIT";
    reasons = generateMustVisitReasons(restaurant, preferences);
  } else if (weightedScore >= 65) {
    verdict = "WORTH A TRY";
    reasons = generateWorthTryingReasons(restaurant, preferences);
  } else {
    verdict = "SKIP IT";
    reasons = generateSkipItReasons(restaurant, preferences);
  }

  return { verdict, reasons };
}