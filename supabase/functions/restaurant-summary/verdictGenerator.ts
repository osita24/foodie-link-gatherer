import { RestaurantFeatures, UserPreferences } from "./types.ts";
import { MatchScores, Verdict, VerdictResult } from "./types/verdictTypes.ts";

function generateMustVisitReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const matchingCuisine = preferences.cuisine_preferences?.find(cuisine => 
    restaurant.types?.some(type => type.toLowerCase().includes(cuisine.toLowerCase()))
  );

  const reasons = [];
  
  // Add cuisine-specific reason
  if (matchingCuisine) {
    reasons.push({
      emoji: "🎯",
      text: `Perfect match: This ${matchingCuisine.toLowerCase()} restaurant aligns with your favorite cuisine`
    });
  }

  // Add dietary-specific reason
  if (preferences.dietary_restrictions?.length && restaurant.servesVegetarianFood) {
    reasons.push({
      emoji: "🥗",
      text: `Accommodates your ${preferences.dietary_restrictions.join(" and ")} preferences with dedicated menu options`
    });
  }

  // Add protein preference reason
  if (preferences.favorite_proteins?.length) {
    const proteinText = preferences.favorite_proteins.length === 1 
      ? preferences.favorite_proteins[0]
      : `${preferences.favorite_proteins.slice(0, -1).join(", ")} and ${preferences.favorite_proteins.slice(-1)}`;
    reasons.push({
      emoji: "🍖",
      text: `Known for dishes featuring ${proteinText.toLowerCase()}, which you prefer`
    });
  }

  // Add atmosphere reason
  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0];
    const atmosphereEmoji = atmosphere === 'Fine Dining' ? "✨" : 
                          atmosphere === 'Casual Dining' ? "🪑" : 
                          atmosphere === 'Bar Scene' ? "🍸" : "🏠";
    reasons.push({
      emoji: atmosphereEmoji,
      text: `Offers the ${atmosphere.toLowerCase()} atmosphere you enjoy`
    });
  }

  // Always include rating if it's good
  if (restaurant.rating && restaurant.rating >= 4.3) {
    reasons.push({
      emoji: "⭐",
      text: `Highly rated at ${restaurant.rating}/5 stars from the community`
    });
  }

  return reasons.slice(0, 3); // Return top 3 reasons
}

function generateWorthTryingReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  // Add rating reason with context
  if (restaurant.rating) {
    reasons.push({
      emoji: "⭐",
      text: `Solid rating of ${restaurant.rating}/5 stars from diners`
    });
  }

  // Add cuisine context
  if (preferences.cuisine_preferences?.length) {
    reasons.push({
      emoji: "🍽️",
      text: `While not your top cuisine choice, their menu offers dishes you might enjoy`
    });
  }

  // Add dietary consideration
  if (preferences.dietary_restrictions?.length) {
    reasons.push({
      emoji: "✔️",
      text: `Can accommodate your ${preferences.dietary_restrictions.join(" and ")} needs with some modifications`
    });
  }

  // Add price context if available
  if (restaurant.priceLevel && preferences.price_range) {
    reasons.push({
      emoji: "💰",
      text: `Price point aligns with your ${preferences.price_range.toLowerCase()} dining preference`
    });
  }

  return reasons.slice(0, 3);
}

function generateSkipItReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  // Add specific dietary warning if applicable
  if (preferences.dietary_restrictions?.length && !restaurant.servesVegetarianFood) {
    reasons.push({
      emoji: "⚠️",
      text: `Limited options for your ${preferences.dietary_restrictions.join(" and ")} dietary needs`
    });
  }

  // Add cuisine mismatch explanation
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0];
    reasons.push({
      emoji: "🍽️",
      text: `Specializes in cuisine different from your preferred ${preferredCuisine.toLowerCase()} style`
    });
  }

  // Add atmosphere mismatch if relevant
  if (preferences.atmosphere_preferences?.length) {
    reasons.push({
      emoji: "🏠",
      text: `Atmosphere differs from your preferred ${preferences.atmosphere_preferences[0].toLowerCase()} setting`
    });
  }

  // Add better alternatives suggestion
  reasons.push({
    emoji: "💡",
    text: "We can suggest restaurants that better match your preferences"
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