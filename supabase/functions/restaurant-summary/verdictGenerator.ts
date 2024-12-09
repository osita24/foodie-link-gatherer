import { RestaurantFeatures, UserPreferences } from "./types.ts";
import { MatchScores, Verdict, VerdictResult } from "./types/verdictTypes.ts";
import {
  generateDietaryReasons,
  generateCuisineReasons,
  generateAtmosphereReasons,
  generatePriceReasons
} from "./utils/reasonGenerators.ts";

function generateMustVisitReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const matchingCuisine = preferences.cuisine_preferences?.find(cuisine => 
    restaurant.types?.some(type => type.toLowerCase().includes(cuisine.toLowerCase()))
  );

  return [
    {
      emoji: "⭐",
      text: matchingCuisine 
        ? `Perfect match: ${matchingCuisine} cuisine with ${restaurant.rating}/5 stars from the community`
        : `Highly-rated ${restaurant.rating}/5 restaurant that matches your preferences`
    },
    {
      emoji: "🎯",
      text: preferences.dietary_restrictions?.length
        ? `Accommodates your ${preferences.dietary_restrictions.join(" and ")} dietary needs perfectly`
        : "Menu variety perfectly suits your taste preferences"
    },
    {
      emoji: "💝",
      text: preferences.atmosphere_preferences?.length
        ? `${preferences.atmosphere_preferences[0]} atmosphere that you prefer`
        : "Welcoming atmosphere with great service"
    }
  ];
}

function generateWorthTryingReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  return [
    {
      emoji: "👍",
      text: `${restaurant.rating}/5 stars suggest good quality and service`
    },
    {
      emoji: "🍽️",
      text: preferences.cuisine_preferences?.length
        ? "Menu includes some dishes that match your taste preferences"
        : "Diverse menu with something for everyone"
    },
    {
      emoji: "💫",
      text: preferences.dietary_restrictions?.length
        ? "Can accommodate your dietary preferences with some modifications"
        : "Good balance of quality and value"
    }
  ];
}

function generateSkipItReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  return [
    {
      emoji: "⚠️",
      text: preferences.dietary_restrictions?.length
        ? `Limited options for your ${preferences.dietary_restrictions.join(" and ")} needs`
        : "May not align well with your usual preferences"
    },
    {
      emoji: "💭",
      text: preferences.cuisine_preferences?.length
        ? `Different cuisine style than your preferred ${preferences.cuisine_preferences[0]}`
        : "Menu options might not match your taste"
    },
    {
      emoji: "🎯",
      text: "We can suggest better matches based on your profile"
    }
  ];
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
  let summaryReasons: Array<{ emoji: string; text: string }>;

  if (hasDietaryRestrictions && !meetsRestrictions) {
    verdict = "SKIP IT";
    summaryReasons = generateSkipItReasons(restaurant, preferences);
  } else if (weightedScore >= 85) {
    verdict = "MUST VISIT";
    summaryReasons = generateMustVisitReasons(restaurant, preferences);
  } else if (weightedScore >= 65) {
    verdict = "WORTH A TRY";
    summaryReasons = generateWorthTryingReasons(restaurant, preferences);
  } else {
    verdict = "SKIP IT";
    summaryReasons = generateSkipItReasons(restaurant, preferences);
  }

  // Combine with specific feature reasons
  const specificReasons = [
    ...generateDietaryReasons(restaurant, preferences),
    ...generateCuisineReasons(restaurant, preferences),
    ...generateAtmosphereReasons(restaurant, preferences),
    ...generatePriceReasons(restaurant, preferences)
  ].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  // Take top 3 reasons, combining both summary and specific reasons
  const finalReasons = [...summaryReasons.slice(0, 2), ...specificReasons.slice(0, 1)];

  return { verdict, reasons: finalReasons };
}