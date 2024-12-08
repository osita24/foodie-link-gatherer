import { RestaurantFeatures, UserPreferences, MatchScores, Reason, Verdict } from "./types.ts";

function generateDietaryReason(restaurant: RestaurantFeatures, preferences: UserPreferences, score: number): Reason | null {
  if (!preferences.dietary_restrictions?.length) return null;

  if (preferences.dietary_restrictions.includes('Vegetarian') && restaurant.servesVegetarianFood) {
    return {
      emoji: "🌱",
      text: "Perfect for your vegetarian diet with dedicated options",
      priority: 1
    };
  }

  if (score < 40) {
    return {
      emoji: "⚠️",
      text: `Limited options for your ${preferences.dietary_restrictions.join(", ")} dietary needs`,
      priority: 1
    };
  }

  return null;
}

function generateCuisineReason(restaurant: RestaurantFeatures, preferences: UserPreferences, score: number): Reason | null {
  if (!preferences.cuisine_preferences?.length) return null;

  const matchingCuisine = restaurant.types?.find(type =>
    preferences.cuisine_preferences.some(pref =>
      type.toLowerCase().includes(pref.toLowerCase())
    )
  );

  if (matchingCuisine) {
    return {
      emoji: "🎯",
      text: `Matches your love for ${matchingCuisine.split("_")[0]} cuisine`,
      priority: 2
    };
  }

  return null;
}

function generateProteinReason(restaurant: RestaurantFeatures, preferences: UserPreferences, score: number): Reason | null {
  if (!preferences.favorite_proteins?.length || preferences.favorite_proteins.includes("Doesn't Apply")) return null;

  const proteinMatches = {
    'Beef': ['steakhouse', 'burger'],
    'Chicken': ['chicken', 'poultry'],
    'Fish': ['seafood', 'fish'],
    'Pork': ['bbq', 'pork'],
    'Lamb': ['mediterranean', 'greek'],
    'Tofu': ['vegetarian', 'asian'],
  };

  const matchingProtein = preferences.favorite_proteins.find(protein =>
    restaurant.types?.some(type =>
      proteinMatches[protein]?.some(keyword =>
        type.toLowerCase().includes(keyword)
      )
    )
  );

  if (matchingProtein) {
    return {
      emoji: "🍖",
      text: `Known for their ${matchingProtein.toLowerCase()} dishes`,
      priority: 3
    };
  }

  return null;
}

function generateAtmosphereReason(restaurant: RestaurantFeatures, preferences: UserPreferences, score: number): Reason | null {
  if (!preferences.atmosphere_preferences?.length) return null;

  const matchingAtmosphere = preferences.atmosphere_preferences.find(pref => {
    switch (pref) {
      case 'Fine Dining': return restaurant.reservable;
      case 'Casual Dining': return restaurant.dineIn;
      case 'Quick Bites': return restaurant.takeout;
      case 'Bar Scene': return restaurant.servesBeer || restaurant.servesWine;
      default: return false;
    }
  });

  if (matchingAtmosphere) {
    return {
      emoji: "✨",
      text: `Perfect ${matchingAtmosphere.toLowerCase()} atmosphere as you prefer`,
      priority: 4
    };
  }

  return null;
}

function generatePriceReason(restaurant: RestaurantFeatures, preferences: UserPreferences, score: number): Reason | null {
  if (!preferences.price_range) return null;

  if (score >= 90) {
    return {
      emoji: "💰",
      text: `Fits your preferred ${preferences.price_range} price range`,
      priority: 5
    };
  }

  if (score <= 60) {
    return {
      emoji: "💸",
      text: `Outside your usual ${preferences.price_range} price range`,
      priority: 5
    };
  }

  return null;
}

export function generateVerdict(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences,
  scores: MatchScores
): { verdict: Verdict; reasons: Array<{ emoji: string; text: string }> } {
  const potentialReasons: (Reason | null)[] = [
    generateDietaryReason(restaurant, preferences, scores.dietaryScore),
    generateCuisineReason(restaurant, preferences, scores.cuisineScore),
    generateProteinReason(restaurant, preferences, scores.proteinScore),
    generateAtmosphereReason(restaurant, preferences, scores.atmosphereScore),
    generatePriceReason(restaurant, preferences, scores.priceScore),
  ];

  // Filter out null reasons and sort by priority
  const validReasons = potentialReasons
    .filter((reason): reason is Reason => reason !== null)
    .sort((a, b) => a.priority - b.priority);

  // Calculate weighted score
  const weightedScore = (
    (scores.dietaryScore * 0.35) +
    (scores.cuisineScore * 0.25) +
    (scores.proteinScore * 0.20) +
    (scores.atmosphereScore * 0.10) +
    (scores.priceScore * 0.10)
  );

  // Determine verdict based on weighted score
  let verdict: Verdict;
  if (weightedScore >= 85) {
    verdict = "MUST VISIT";
  } else if (weightedScore >= 65) {
    verdict = "WORTH A TRY";
  } else {
    verdict = "SKIP IT";
  }

  // If we don't have enough personalized reasons, add rating-based reason
  if (validReasons.length < 3 && restaurant.rating && restaurant.rating >= 4.5) {
    validReasons.push({
      emoji: "⭐",
      text: "Highly rated by other diners",
      priority: 6
    });
  }

  // Take top 3 reasons
  const finalReasons = validReasons.slice(0, 3).map(({ emoji, text }) => ({ emoji, text }));

  return { verdict, reasons: finalReasons };
}