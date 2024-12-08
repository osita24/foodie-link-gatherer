import { RestaurantFeatures, UserPreferences, MatchScores, Reason, Verdict } from "./types.ts";

function generateDietaryReason(restaurant: RestaurantFeatures, preferences: UserPreferences, score: number): Reason | null {
  if (!preferences.dietary_restrictions?.length) return null;

  // For vegetarians
  if (preferences.dietary_restrictions.includes('Vegetarian')) {
    if (restaurant.servesVegetarianFood) {
      return {
        emoji: "🌱",
        text: "Great vegetarian options available",
        priority: 1
      };
    } else {
      return {
        emoji: "⚠️",
        text: "Limited vegetarian options available",
        priority: 1
      };
    }
  }

  // For specific diets like keto, low-carb
  const specialDiets = ['Keto-Friendly', 'Low-Carb'];
  const matchingDiets = preferences.dietary_restrictions.filter(diet => 
    specialDiets.includes(diet)
  );

  if (matchingDiets.length > 0) {
    const dietText = matchingDiets.join(" and ");
    return {
      emoji: "🥗",
      text: `Menu can accommodate ${dietText} preferences`,
      priority: 1
    };
  }

  return null;
}

function generateCuisineReason(restaurant: RestaurantFeatures, preferences: UserPreferences, score: number): Reason | null {
  if (!preferences.cuisine_preferences?.length) return null;

  const matchingCuisines = restaurant.types?.filter(type =>
    preferences.cuisine_preferences.some(pref =>
      type.toLowerCase().includes(pref.toLowerCase())
    )
  );

  if (matchingCuisines?.length) {
    const cuisineType = matchingCuisines[0].split('_')[0];
    return {
      emoji: "🎯",
      text: `Matches your love for ${cuisineType} cuisine`,
      priority: 2
    };
  }

  return null;
}

function generateAtmosphereReason(restaurant: RestaurantFeatures, preferences: UserPreferences, score: number): Reason | null {
  if (!preferences.atmosphere_preferences?.length) return null;

  const atmosphereMatches = {
    'Fine Dining': restaurant.reservable,
    'Casual Dining': restaurant.dineIn,
    'Quick Bites': restaurant.takeout,
    'Bar Scene': restaurant.servesBeer || restaurant.servesWine
  };

  const matchingAtmosphere = preferences.atmosphere_preferences.find(pref => atmosphereMatches[pref]);

  if (matchingAtmosphere) {
    return {
      emoji: "✨",
      text: `Perfect ${matchingAtmosphere.toLowerCase()} spot as you prefer`,
      priority: 3
    };
  }

  return null;
}

function generatePriceReason(restaurant: RestaurantFeatures, preferences: UserPreferences, score: number): Reason | null {
  if (!preferences.price_range) return null;

  const priceDescriptions = {
    'budget': 'budget-friendly',
    'moderate': 'moderately priced',
    'upscale': 'upscale',
    'luxury': 'high-end'
  };

  if (score >= 90) {
    return {
      emoji: "💰",
      text: `Perfectly ${priceDescriptions[preferences.price_range]} for your budget`,
      priority: 4
    };
  }

  if (score <= 60) {
    const isMoreExpensive = (restaurant.priceLevel || 2) > 
      (['budget', 'moderate'].includes(preferences.price_range) ? 2 : 3);
    
    return {
      emoji: "💸",
      text: isMoreExpensive ? 
        "More expensive than your usual preference" :
        "More affordable than your usual preference",
      priority: 4
    };
  }

  return null;
}

export function generateVerdict(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences,
  scores: MatchScores
): { verdict: Verdict; reasons: Array<{ emoji: string; text: string }> } {
  // Calculate weighted score with higher emphasis on dietary and cuisine matches
  const weightedScore = (
    (scores.dietaryScore * 0.35) +
    (scores.cuisineScore * 0.25) +
    (scores.proteinScore * 0.20) +
    (scores.atmosphereScore * 0.10) +
    (scores.priceScore * 0.10)
  );

  // Generate all possible reasons
  const potentialReasons: (Reason | null)[] = [
    generateDietaryReason(restaurant, preferences, scores.dietaryScore),
    generateCuisineReason(restaurant, preferences, scores.cuisineScore),
    generateAtmosphereReason(restaurant, preferences, scores.atmosphereScore),
    generatePriceReason(restaurant, preferences, scores.priceScore),
  ];

  // Filter out null reasons and sort by priority
  const validReasons = potentialReasons
    .filter((reason): reason is Reason => reason !== null)
    .sort((a, b) => a.priority - b.priority);

  // Determine verdict based on weighted score and dietary restrictions
  let verdict: Verdict;
  const hasDietaryRestrictions = preferences.dietary_restrictions?.length > 0;
  const meetsRestrictions = scores.dietaryScore >= 70;

  if (hasDietaryRestrictions && !meetsRestrictions) {
    verdict = "CONSIDER WITH CARE";
  } else if (weightedScore >= 85) {
    verdict = "PERFECT MATCH";
  } else if (weightedScore >= 65) {
    verdict = "WORTH EXPLORING";
  } else {
    verdict = "CONSIDER WITH CARE";
  }

  // If we don't have enough personalized reasons and it's worth exploring or better,
  // we can add a rating-based reason
  if (validReasons.length < 3 && 
      verdict !== "CONSIDER WITH CARE" && 
      restaurant.rating && 
      restaurant.rating >= 4.5) {
    validReasons.push({
      emoji: "⭐",
      text: `Well-loved by the community with ${restaurant.rating}/5 stars`,
      priority: 5
    });
  }

  // Take top 3 reasons
  const finalReasons = validReasons.slice(0, 3).map(({ emoji, text }) => ({ emoji, text }));

  return { verdict, reasons: finalReasons };
}