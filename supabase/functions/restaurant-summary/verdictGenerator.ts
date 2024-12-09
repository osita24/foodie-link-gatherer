import { RestaurantFeatures, UserPreferences, MatchScores, Reason, Verdict } from "./types.ts";

function generateDietaryReason(restaurant: RestaurantFeatures, preferences: UserPreferences, score: number): Reason | null {
  if (!preferences.dietary_restrictions?.length) return null;

  // For vegetarians
  if (preferences.dietary_restrictions.includes('Vegetarian')) {
    if (restaurant.servesVegetarianFood) {
      return {
        emoji: "🥗",
        text: "Perfect for your vegetarian diet",
        priority: 1
      };
    } else {
      return {
        emoji: "⚠️",
        text: "May have limited vegetarian options",
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
      emoji: "✅",
      text: `Menu aligns with your ${dietText} preferences`,
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
    return {
      emoji: "🎯",
      text: `Matches your favorite ${matchingCuisines[0].split('_')[0]} cuisine`,
      priority: 2
    };
  }

  return null;
}

function generateProteinReason(restaurant: RestaurantFeatures, preferences: UserPreferences): Reason | null {
  if (!preferences.favorite_proteins?.length) return null;

  // This is a simplified check - in reality, you'd want to analyze the menu items
  const hasPreferredProtein = preferences.favorite_proteins.some(protein =>
    restaurant.name.toLowerCase().includes(protein.toLowerCase()) ||
    restaurant.types?.some(type => type.toLowerCase().includes(protein.toLowerCase()))
  );

  if (hasPreferredProtein) {
    return {
      emoji: "🍖",
      text: "Features your preferred protein choices",
      priority: 3
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
    const emojiMap = {
      'Fine Dining': '✨',
      'Casual Dining': '🍽️',
      'Quick Bites': '⚡',
      'Bar Scene': '🍷'
    };

    return {
      emoji: emojiMap[matchingAtmosphere],
      text: `Perfect ${matchingAtmosphere.toLowerCase()} atmosphere as you prefer`,
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
    generateProteinReason(restaurant, preferences),
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

  // Generate personalized verdict with explanation
  let summaryReasons: Array<{ emoji: string; text: string }> = [];

  if (hasDietaryRestrictions && !meetsRestrictions) {
    verdict = "SKIP IT";
    summaryReasons = [
      {
        emoji: "⚠️",
        text: `This restaurant might not accommodate your ${preferences.dietary_restrictions.join(" and ")} dietary needs well`
      },
      {
        emoji: "🔍",
        text: "We recommend finding a more suitable option that aligns with your dietary preferences"
      },
      {
        emoji: "💡",
        text: "Consider checking our other recommended restaurants that better match your requirements"
      }
    ];
  } else if (weightedScore >= 85) {
    verdict = "MUST VISIT";
    const matchingCuisine = preferences.cuisine_preferences?.find(cuisine => 
      restaurant.types?.some(type => type.toLowerCase().includes(cuisine.toLowerCase()))
    );
    summaryReasons = [
      {
        emoji: "🎯",
        text: matchingCuisine 
          ? `Perfect match for your ${matchingCuisine} cuisine preference`
          : "Exceptionally well-aligned with your preferences"
      },
      {
        emoji: "✨",
        text: `The atmosphere and dining style match exactly what you enjoy`
      },
      {
        emoji: "💝",
        text: "Based on your preferences, we think you'll love this place"
      }
    ];
  } else if (weightedScore >= 65) {
    verdict = "WORTH A TRY";
    summaryReasons = [
      {
        emoji: "👍",
        text: "Several aspects of this restaurant align with your preferences"
      },
      {
        emoji: "💭",
        text: "While not a perfect match, it offers enough of what you enjoy"
      },
      {
        emoji: "🌟",
        text: "Could be a good opportunity to try something slightly different"
      }
    ];
  } else {
    verdict = "SKIP IT";
    summaryReasons = [
      {
        emoji: "📊",
        text: "This place doesn't quite match your usual preferences"
      },
      {
        emoji: "💭",
        text: "We have other options that would better suit your taste"
      },
      {
        emoji: "🎯",
        text: "Based on your profile, we think you might not enjoy it as much"
      }
    ];
  }

  // Take top 3 reasons, combining both summary and specific reasons
  const finalReasons = [...summaryReasons, ...validReasons.slice(0, 2)];

  return { verdict, reasons: finalReasons };
}