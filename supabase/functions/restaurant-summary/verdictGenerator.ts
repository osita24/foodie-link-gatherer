import { RestaurantFeatures, UserPreferences } from "./types.ts";
import { MatchScores, Verdict, VerdictResult } from "./types/verdictTypes.ts";
import { checkDietaryCompatibility } from "./utils/dietaryUtils.ts";
import { generatePositiveReasons, generateNegativeReasons } from "./utils/reasonGenerators.ts";

export function generateVerdict(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences,
  scores: MatchScores
): VerdictResult {
  console.log("🎯 Generating verdict for:", restaurant.name);
  console.log("📊 Match scores:", scores);

  // First, check dietary compatibility
  const dietaryCheck = checkDietaryCompatibility(restaurant, preferences);
  if (!dietaryCheck.isCompatible) {
    console.log("❌ Restaurant incompatible with dietary restrictions:", dietaryCheck.reason);
    const reasons = generateNegativeReasons(restaurant, preferences);
    // Ensure exactly 3 reasons
    while (reasons.length < 3) {
      reasons.push({
        emoji: "⚠️",
        text: "May not align with your dietary preferences"
      });
    }
    return {
      verdict: "CONSIDER ALTERNATIVES",
      reasons: reasons.slice(0, 3)
    };
  }

  // Calculate weighted score only if dietary compatible
  const weightedScore = (
    (scores.dietaryScore * 0.35) +
    (scores.cuisineScore * 0.25) +
    (scores.proteinScore * 0.20) +
    (scores.atmosphereScore * 0.10) +
    (scores.priceScore * 0.10)
  );

  console.log("📊 Weighted score:", weightedScore);

  let verdict: Verdict;
  let reasons = weightedScore >= 85 
    ? generatePositiveReasons(restaurant, preferences)
    : weightedScore >= 65 
      ? generatePositiveReasons(restaurant, preferences)
      : generateNegativeReasons(restaurant, preferences);

  // Ensure exactly 3 reasons
  while (reasons.length < 3) {
    if (weightedScore >= 65) {
      reasons.push({
        emoji: "✨",
        text: "Generally matches your preferences"
      });
    } else {
      reasons.push({
        emoji: "⚠️",
        text: "May not fully match your preferences"
      });
    }
  }

  // Set verdict based on score
  if (weightedScore >= 85) {
    verdict = "PERFECT MATCH";
  } else if (weightedScore >= 65) {
    verdict = "WORTH EXPLORING";
  } else {
    verdict = "CONSIDER ALTERNATIVES";
  }

  console.log("✨ Generated verdict:", verdict);
  console.log("📝 Generated reasons:", reasons);

  return { 
    verdict, 
    reasons: reasons.slice(0, 3) // Ensure exactly 3 reasons
  };
}