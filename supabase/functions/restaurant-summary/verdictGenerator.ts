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

  // First, check dietary compatibility - more lenient now
  const dietaryCheck = checkDietaryCompatibility(restaurant, preferences);
  if (!dietaryCheck.isCompatible && scores.dietaryScore < 30) {
    console.log("⚠️ Restaurant has significant dietary conflicts");
    return {
      verdict: "CONSIDER ALTERNATIVES",
      reasons: generateNegativeReasons(restaurant, preferences)
    };
  }

  // Calculate weighted score with reduced impact from dietary restrictions
  const weightedScore = (
    (scores.dietaryScore * 0.25) + // Reduced from 0.35
    (scores.cuisineScore * 0.30) + // Increased from 0.25
    (scores.proteinScore * 0.25) + // Increased from 0.20
    (scores.atmosphereScore * 0.10) +
    (scores.priceScore * 0.10)
  );

  console.log("📊 Weighted score:", weightedScore);

  let verdict: Verdict;
  let reasons: Array<{ emoji: string; text: string }>;

  // More lenient thresholds
  if (weightedScore >= 75) { // Reduced from 85
    verdict = "PERFECT MATCH";
    reasons = generatePositiveReasons(restaurant, preferences);
  } else if (weightedScore >= 55) { // Reduced from 65
    verdict = "WORTH EXPLORING";
    reasons = generatePositiveReasons(restaurant, preferences);
  } else {
    verdict = "CONSIDER ALTERNATIVES";
    reasons = generateNegativeReasons(restaurant, preferences);
  }

  console.log("✨ Generated verdict:", verdict);
  console.log("📝 Generated reasons:", reasons);

  return { verdict, reasons };
}