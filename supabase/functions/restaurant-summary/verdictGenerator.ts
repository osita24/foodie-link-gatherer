import { RestaurantFeatures, UserPreferences } from "./types.ts";
import { MatchScores, Verdict, VerdictResult } from "./types/verdictTypes.ts";

function generatePersonalizedReasons(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences,
  scores: MatchScores
): Array<{ emoji: string; text: string }> {
  const reasons = [];

  // Highly personalized cuisine match
  if (preferences.cuisine_preferences?.length) {
    const matchingCuisines = restaurant.types?.filter(type =>
      preferences.cuisine_preferences.some(pref => 
        type.toLowerCase().includes(pref.toLowerCase())
      )
    );

    if (matchingCuisines?.length) {
      reasons.push({
        emoji: "🎯",
        text: `Perfect match for your ${preferences.cuisine_preferences[0]} cravings - they specialize in exactly what you love!`
      });
    }
  }

  // Detailed dietary compatibility
  if (preferences.dietary_restrictions?.length) {
    const restriction = preferences.dietary_restrictions[0];
    if (restaurant.servesVegetarianFood && restriction.toLowerCase().includes('vegetarian')) {
      reasons.push({
        emoji: "🥗",
        text: `Extensive ${restriction} menu options available - this place truly understands your dietary needs`
      });
    } else if (restriction) {
      const accommodating = scores.dietaryScore > 70;
      reasons.push({
        emoji: accommodating ? "✅" : "⚠️",
        text: accommodating 
          ? `Well-equipped to handle your ${restriction} requirements - just let them know when ordering`
          : `Limited options for your ${restriction} needs - consider checking the menu carefully`
      });
    }
  }

  // Atmosphere match
  if (preferences.atmosphere_preferences?.length) {
    const preferredAtmosphere = preferences.atmosphere_preferences[0];
    const atmosphereMatch = {
      'Fine Dining': restaurant.reservable,
      'Casual Dining': restaurant.dineIn,
      'Quick Bites': restaurant.takeout,
      'Bar Scene': restaurant.servesBeer || restaurant.servesWine
    }[preferredAtmosphere];

    if (atmosphereMatch) {
      reasons.push({
        emoji: "✨",
        text: `The ${preferredAtmosphere.toLowerCase()} atmosphere matches your preferred dining style perfectly`
      });
    }
  }

  // Price alignment
  if (preferences.price_range && restaurant.priceLevel) {
    const priceRangeMap = {
      'budget': [1],
      'moderate': [1, 2],
      'upscale': [2, 3],
      'luxury': [3, 4]
    };
    
    const isInRange = priceRangeMap[preferences.price_range]?.includes(restaurant.priceLevel);
    if (isInRange) {
      reasons.push({
        emoji: "💰",
        text: `Pricing aligns perfectly with your ${preferences.price_range} preference`
      });
    }
  }

  // Rating context if exceptional
  if (restaurant.rating && restaurant.rating >= 4.5) {
    reasons.push({
      emoji: "⭐",
      text: `Outstanding ${restaurant.rating}/5 rating from ${restaurant.userRatingsTotal}+ diners who share your preferences`
    });
  }

  return reasons.slice(0, 3);
}

export function generateVerdict(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences,
  scores: MatchScores
): VerdictResult {
  console.log("🎯 Generating verdict for:", restaurant.name);
  console.log("👤 User preferences:", preferences);
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
  if (hasDietaryRestrictions && !meetsRestrictions) {
    verdict = "SKIP IT";
  } else if (weightedScore >= 85) {
    verdict = "MUST VISIT";
  } else if (weightedScore >= 65) {
    verdict = "WORTH A TRY";
  } else {
    verdict = "SKIP IT";
  }

  console.log("✨ Generated verdict:", verdict);
  const reasons = generatePersonalizedReasons(restaurant, preferences, scores);
  console.log("📝 Generated reasons:", reasons);

  return { verdict, reasons };
}