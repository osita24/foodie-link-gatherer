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

  // CRITICAL DIETARY CHECKS FIRST (e.g., vegetarian, vegan, allergies)
  const dietaryConflict = checkDietaryConflicts(itemContent, preferences);
  if (dietaryConflict) {
    console.log("❌ Critical dietary conflict found:", dietaryConflict);
    return { score: 0, factors }; // Immediate rejection for dietary conflicts
  }

  // FOOD AVOIDANCE PENALTIES (allergies and strong dislikes)
  const avoidanceResult = checkFoodsToAvoid(itemContent, preferences);
  if (avoidanceResult.matches.length > 0) {
    console.log("⚠️ Found avoided foods:", avoidanceResult.matches);
    // Severe penalty for each avoided item
    factors.avoidanceImpact = -25 * avoidanceResult.matches.length;
  }

  // Calculate base score without cuisine preferences
  // 1. Protein Preferences (25% weight)
  if (!preferences.dietary_restrictions?.includes('Vegetarian') && 
      !preferences.dietary_restrictions?.includes('Vegan')) {
    const proteinMatch = checkProteinMatch(itemContent, preferences);
    factors.proteinMatch = proteinMatch ? 25 : 0;
    console.log("🥩 Protein match score:", factors.proteinMatch);
  }

  // 2. Favorite Ingredients (20% weight)
  const ingredientMatch = checkIngredientMatch(itemContent, preferences);
  factors.ingredientMatch = ingredientMatch ? 20 : 0;
  console.log("🌶️ Ingredient match score:", factors.ingredientMatch);

  // 3. Preparation Methods (15% weight)
  const prepScore = analyzePreparationMethods(itemContent);
  factors.preparationMatch = prepScore;
  console.log("👨‍🍳 Preparation method score:", factors.preparationMatch);

  // Base score calculation without cuisine
  const baseScore = 40; // Increased base score to compensate for cuisine being optional

  // Calculate initial score without cuisine bonus
  let totalScore = Math.min(100, Math.max(0, 
    baseScore + 
    factors.proteinMatch + 
    factors.ingredientMatch + 
    factors.preparationMatch +
    factors.avoidanceImpact
  ));

  // Add cuisine bonus (up to 25% extra) if there's a match
  const cuisineMatch = checkCuisineMatch(itemContent, preferences);
  if (cuisineMatch) {
    factors.cuisineMatch = 25;
    totalScore = Math.min(100, totalScore + 25); // Add cuisine bonus but cap at 100
    console.log("🍽️ Added cuisine match bonus:", factors.cuisineMatch);
  }

  console.log("📊 Final score calculation:", {
    baseScore,
    factors,
    totalScore
  });

  return { score: totalScore, factors };
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

const checkIngredientMatch = (itemContent: string, preferences: any): boolean => {
  return preferences.favorite_ingredients?.some(
    (ingredient: string) => itemContent.toLowerCase().includes(ingredient.toLowerCase())
  ) || false;
};

const analyzePreparationMethods = (itemContent: string): number => {
  const healthyMethods = {
    'grilled': 15,
    'steamed': 15,
    'baked': 10,
    'roasted': 10,
    'fresh': 10,
    'house-made': 5,
    'organic': 10,
    'seasonal': 5
  };

  let score = 0;
  Object.entries(healthyMethods).forEach(([method, points]) => {
    if (itemContent.toLowerCase().includes(method)) {
      score += points;
    }
  });

  return Math.min(15, score); // Cap preparation score at 15%
};