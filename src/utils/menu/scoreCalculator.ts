import { checkDietaryConflicts } from './dietaryChecker';
import { checkFoodsToAvoid } from './foodAvoidanceChecker';

interface ScoreFactors {
  dietaryMatch: number;
  proteinMatch: number;
  cuisineMatch: number;
  ingredientMatch: number;
  preparationMatch: number;
  avoidanceImpact: number;
}

export const calculateMenuItemScore = (
  itemContent: string,
  preferences: any
): { score: number; factors: ScoreFactors } => {
  console.log("🔍 Analyzing menu item:", itemContent);
  console.log("👤 User preferences:", preferences);

  const factors: ScoreFactors = {
    dietaryMatch: 0,
    proteinMatch: 0,
    cuisineMatch: 0,
    ingredientMatch: 0,
    preparationMatch: 0,
    avoidanceImpact: 0
  };

  // CRITICAL DIETARY CHECKS FIRST
  const dietaryConflict = checkDietaryConflicts(itemContent, preferences);
  if (dietaryConflict) {
    console.log("❌ Critical dietary conflict found:", dietaryConflict);
    return { score: 0, factors }; // Immediate rejection
  }

  // FOOD AVOIDANCE PENALTIES
  const avoidanceResult = checkFoodsToAvoid(itemContent, preferences);
  if (avoidanceResult.matches.length > 0) {
    console.log("⚠️ Found avoided foods:", avoidanceResult.matches);
    // Progressive penalty: each additional avoided item has less impact
    factors.avoidanceImpact = -30 * (1 - (0.2 * (avoidanceResult.matches.length - 1)));
    console.log("📉 Avoidance impact:", factors.avoidanceImpact);
  }

  // Base score starts at 45% if no dietary conflicts
  const baseScore = 45;

  // PROTEIN PREFERENCES (25% max)
  if (!preferences.dietary_restrictions?.includes('Vegetarian') && 
      !preferences.dietary_restrictions?.includes('Vegan')) {
    const proteinMatch = checkProteinMatch(itemContent, preferences);
    // Bonus points if it's a preferred protein
    factors.proteinMatch = proteinMatch ? 25 : 0;
    console.log("🥩 Protein match score:", factors.proteinMatch);
  } else {
    // Vegetarian/Vegan bonus: redistribute protein points to base score
    factors.proteinMatch = 15; // Reward for matching dietary preference
    console.log("🌱 Vegetarian/Vegan bonus applied");
  }

  // FAVORITE INGREDIENTS (20% max)
  const ingredientMatches = checkIngredientMatches(itemContent, preferences);
  // Scale score based on number of matching ingredients
  factors.ingredientMatch = Math.min(20, ingredientMatches * 10);
  console.log("🌶️ Ingredient match score:", factors.ingredientMatch);

  // PREPARATION METHODS (10% max)
  const prepScore = analyzePreparationMethods(itemContent);
  factors.preparationMatch = prepScore;
  console.log("👨‍🍳 Preparation method score:", factors.preparationMatch);

  // Calculate initial score
  let totalScore = Math.min(100, Math.max(0, 
    baseScore + 
    factors.proteinMatch + 
    factors.ingredientMatch + 
    factors.preparationMatch +
    factors.avoidanceImpact
  ));

  // CUISINE BONUS (up to 25% extra)
  const cuisineMatch = checkCuisineMatch(itemContent, preferences);
  if (cuisineMatch) {
    // Apply cuisine bonus proportionally to current score
    const bonusAmount = Math.min(25, totalScore * 0.25);
    factors.cuisineMatch = bonusAmount;
    totalScore = Math.min(100, totalScore + bonusAmount);
    console.log("🍽️ Added proportional cuisine bonus:", bonusAmount);
  }

  console.log("📊 Final score calculation:", {
    baseScore,
    factors,
    totalScore
  });

  return { score: Math.round(totalScore), factors };
};

const checkProteinMatch = (itemContent: string, preferences: any): boolean => {
  return preferences.favorite_proteins?.some(
    (protein: string) => {
      if (protein === "Doesn't Apply") return false;
      return itemContent.toLowerCase().includes(protein.toLowerCase());
    }
  ) || false;
};

const checkCuisineMatch = (itemContent: string, preferences: any): boolean => {
  return preferences.cuisine_preferences?.some(
    (cuisine: string) => itemContent.toLowerCase().includes(cuisine.toLowerCase())
  ) || false;
};

const checkIngredientMatches = (itemContent: string, preferences: any): number => {
  if (!preferences.favorite_ingredients?.length) return 0;
  
  const matches = preferences.favorite_ingredients.filter(
    (ingredient: string) => itemContent.toLowerCase().includes(ingredient.toLowerCase())
  );
  
  return matches.length;
};

const analyzePreparationMethods = (itemContent: string): number => {
  const healthyMethods = {
    'grilled': 10,
    'steamed': 10,
    'baked': 8,
    'roasted': 8,
    'fresh': 7,
    'house-made': 5,
    'organic': 7,
    'seasonal': 5,
    'raw': 5,
    'sautéed': 4
  };

  let score = 0;
  Object.entries(healthyMethods).forEach(([method, points]) => {
    if (itemContent.toLowerCase().includes(method)) {
      score += points;
    }
  });

  return Math.min(10, score); // Cap preparation score at 10%
};