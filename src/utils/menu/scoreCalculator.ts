import { MenuAnalysisResult, ScoreFactors } from './types';

export const calculateMenuItemScore = async (
  itemContent: string,
  preferences: any
): Promise<MenuAnalysisResult> => {
  console.log("🔍 Starting menu item analysis for:", itemContent);
  console.log("👤 User preferences:", preferences);

  const content = itemContent.toLowerCase();

  // Check dietary restrictions
  const hasDietaryRestriction = preferences.dietary_restrictions?.some(
    (restriction: string) => content.includes(restriction.toLowerCase())
  );

  if (hasDietaryRestriction) {
    console.log("❌ Item contains dietary restrictions");
    return {
      score: 20,
      factors: {
        dietaryMatch: 0,
        proteinMatch: 0,
        cuisineMatch: 0,
        ingredientMatch: 0,
        preparationMatch: 0
      }
    };
  }

  // Calculate protein match
  const proteinMatch = preferences.favorite_proteins?.some(
    (protein: string) => content.includes(protein.toLowerCase())
  ) ? 25 : 0;

  // Check for high sodium indicators
  const highSodiumKeywords = ['salty', 'brined', 'cured', 'pickled', 'soy sauce', 'fish sauce', 'teriyaki'];
  const hasHighSodiumIndicators = highSodiumKeywords.some(keyword => content.includes(keyword));
  const sodiumPenalty = preferences.favorite_ingredients?.includes('High Sodium') && hasHighSodiumIndicators ? -30 : 0;

  // Calculate preparation method score
  const friedKeywords = ['fried', 'deep-fried', 'crispy'];
  const isFried = friedKeywords.some(keyword => content.includes(keyword));
  const prepScore = isFried ? 0 : 20;

  // Calculate ingredient match
  const ingredientMatch = preferences.favorite_ingredients?.some(
    (ingredient: string) => content.includes(ingredient.toLowerCase())
  ) ? 25 : 0;

  // Calculate final score components
  const factors: ScoreFactors = {
    dietaryMatch: hasDietaryRestriction ? 0 : 30,
    proteinMatch,
    cuisineMatch: 0, // Simplified for now
    ingredientMatch,
    preparationMatch: prepScore
  };

  const totalScore = Math.min(100, Math.max(0,
    Object.values(factors).reduce((sum, score) => sum + score, 0) + sodiumPenalty
  ));

  console.log("📊 Final score calculation:", {
    factors,
    sodiumPenalty,
    totalScore
  });

  return { 
    score: totalScore, 
    factors,
    matchType: totalScore > 80 ? 'perfect' : totalScore > 60 ? 'good' : totalScore > 40 ? 'neutral' : 'warning',
    reason: getMatchReason(totalScore, factors, preferences)
  };
};

function getMatchReason(score: number, factors: ScoreFactors, preferences: any): string {
  if (score < 40) {
    return "This item may not match your dietary preferences";
  }

  if (factors.proteinMatch > 0) {
    return "Contains your preferred proteins";
  }

  if (factors.ingredientMatch > 0) {
    return "Includes ingredients you enjoy";
  }

  if (factors.dietaryMatch > 0) {
    return "Meets your dietary requirements";
  }

  return "Neutral match based on your preferences";
}