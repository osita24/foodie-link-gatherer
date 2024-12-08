interface ScoreFactors {
  dietaryMatch: number;
  proteinMatch: number;
  cuisineMatch: number;
  ingredientMatch: number;
  preparationMatch: number;
}

export const calculateMenuItemScore = (
  itemContent: string,
  preferences: any
): { score: number; factors: ScoreFactors } => {
  const factors: ScoreFactors = {
    dietaryMatch: 0,
    proteinMatch: 0,
    cuisineMatch: 0,
    ingredientMatch: 0,
    preparationMatch: 0
  };

  // Critical: Check dietary restrictions first
  const hasDietaryConflict = checkDietaryConflicts(itemContent, preferences);
  if (hasDietaryConflict) {
    return { score: 20, factors };
  }

  // Check protein preferences (significant boost)
  const proteinMatch = checkProteinMatch(itemContent, preferences);
  factors.proteinMatch = proteinMatch ? 35 : 0;

  // Check cuisine preferences
  const cuisineMatch = checkCuisineMatch(itemContent, preferences);
  factors.cuisineMatch = cuisineMatch ? 25 : 0;

  // Check favorite ingredients
  const ingredientMatch = checkIngredientMatch(itemContent, preferences);
  factors.ingredientMatch = ingredientMatch ? 20 : 0;

  // Analyze preparation methods
  const prepScore = analyzePreparationMethods(itemContent);
  factors.preparationMatch = prepScore;

  // Calculate final score
  const baseScore = 50;
  const totalScore = baseScore + 
    factors.proteinMatch + 
    factors.cuisineMatch + 
    factors.ingredientMatch + 
    factors.preparationMatch;

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    factors
  };
};

const checkDietaryConflicts = (itemContent: string, preferences: any): boolean => {
  const dietaryRestrictions = preferences.dietary_restrictions || [];
  
  const restrictionKeywords: Record<string, string[]> = {
    'vegetarian': ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood'],
    'vegan': ['meat', 'cheese', 'cream', 'milk', 'egg', 'butter', 'honey'],
    'gluten-free': ['bread', 'pasta', 'flour', 'wheat', 'tortilla', 'breaded']
  };

  return dietaryRestrictions.some((restriction: string) => {
    const keywords = restrictionKeywords[restriction.toLowerCase()] || [restriction];
    return keywords.some(keyword => itemContent.includes(keyword));
  });
};

const checkProteinMatch = (itemContent: string, preferences: any): boolean => {
  return preferences.favorite_proteins?.some(
    (protein: string) => itemContent.includes(protein.toLowerCase())
  ) || false;
};

const checkCuisineMatch = (itemContent: string, preferences: any): boolean => {
  return preferences.cuisine_preferences?.some(
    (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
  ) || false;
};

const checkIngredientMatch = (itemContent: string, preferences: any): boolean => {
  return preferences.favorite_ingredients?.some(
    (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
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
    if (itemContent.includes(method)) {
      score += points;
    }
  });

  return Math.min(20, score); // Cap preparation score at 20
};