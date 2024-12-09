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
  console.log("🔍 Analyzing menu item:", itemContent);
  console.log("👤 User preferences:", preferences);

  const factors: ScoreFactors = {
    dietaryMatch: 0,
    proteinMatch: 0,
    cuisineMatch: 0,
    ingredientMatch: 0,
    preparationMatch: 0
  };

  // CRITICAL CHECKS FIRST - These are absolute deal-breakers
  
  // 1. Check dietary restrictions (e.g., vegetarian, vegan)
  const dietaryConflict = checkDietaryConflicts(itemContent, preferences);
  if (dietaryConflict) {
    console.log("❌ Critical dietary conflict found:", dietaryConflict);
    return { score: 0, factors }; // Complete rejection for dietary conflicts
  }

  // 2. Check foods to avoid (allergies, etc.)
  const avoidanceConflict = checkFoodsToAvoid(itemContent, preferences);
  if (avoidanceConflict) {
    console.log("❌ Contains food to avoid:", avoidanceConflict);
    return { score: 0, factors }; // Complete rejection for avoided foods
  }

  // PREFERENCE SCORING
  
  // 3. Check protein preferences (if applicable)
  if (!preferences.dietary_restrictions?.includes('Vegetarian') && 
      !preferences.dietary_restrictions?.includes('Vegan')) {
    const proteinMatch = checkProteinMatch(itemContent, preferences);
    factors.proteinMatch = proteinMatch ? 35 : 0;
    console.log("🥩 Protein match score:", factors.proteinMatch);
  }

  // 4. Check cuisine preferences
  const cuisineMatch = checkCuisineMatch(itemContent, preferences);
  factors.cuisineMatch = cuisineMatch ? 25 : 0;
  console.log("🍽️ Cuisine match score:", factors.cuisineMatch);

  // 5. Check favorite ingredients
  const ingredientMatch = checkIngredientMatch(itemContent, preferences);
  factors.ingredientMatch = ingredientMatch ? 20 : 0;
  console.log("🌶️ Ingredient match score:", factors.ingredientMatch);

  // 6. Analyze preparation methods
  const prepScore = analyzePreparationMethods(itemContent);
  factors.preparationMatch = prepScore;
  console.log("👨‍🍳 Preparation method score:", factors.preparationMatch);

  const baseScore = 50;
  const totalScore = Math.min(100, Math.max(0, 
    baseScore + 
    factors.proteinMatch + 
    factors.cuisineMatch + 
    factors.ingredientMatch + 
    factors.preparationMatch
  ));

  console.log("📊 Final score calculation:", {
    baseScore,
    factors,
    totalScore
  });

  return { score: totalScore, factors };
};

const checkDietaryConflicts = (itemContent: string, preferences: any): string | null => {
  const dietaryRestrictions = preferences.dietary_restrictions || [];
  
  const restrictionKeywords: Record<string, string[]> = {
    'Vegetarian': [
      'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb', 'turkey',
      'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni', 'anchovy',
      'duck', 'veal', 'foie gras', 'chorizo', 'sausage'
    ],
    'Vegan': [
      'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb', 'turkey',
      'cheese', 'cream', 'milk', 'egg', 'butter', 'honey', 'yogurt', 'mayo',
      'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni', 'anchovy',
      'duck', 'veal', 'foie gras', 'chorizo', 'sausage', 'gelatin',
      'whey', 'casein', 'ghee', 'lard', 'aioli'
    ],
    'Gluten-Free': [
      'bread', 'pasta', 'flour', 'wheat', 'tortilla', 'breaded', 'crusted',
      'battered', 'soy sauce', 'teriyaki', 'noodles', 'ramen', 'udon',
      'couscous', 'barley', 'malt', 'seitan', 'panko'
    ],
    'Dairy-Free': [
      'cheese', 'cream', 'milk', 'butter', 'yogurt', 'mayo',
      'parmesan', 'mozzarella', 'ricotta', 'alfredo', 'béchamel',
      'queso', 'crema', 'burrata', 'mascarpone', 'provolone'
    ]
  };

  for (const restriction of dietaryRestrictions) {
    const keywords = restrictionKeywords[restriction] || [restriction.toLowerCase()];
    for (const keyword of keywords) {
      if (itemContent.toLowerCase().includes(keyword.toLowerCase())) {
        return restriction;
      }
    }
  }

  return null;
};

const checkFoodsToAvoid = (itemContent: string, preferences: any): string | null => {
  const foodsToAvoid = preferences.foodsToAvoid || [];
  
  const avoidanceKeywords: Record<string, string[]> = {
    'Shellfish': ['shrimp', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'crawfish', 'prawn'],
    'Peanuts': ['peanut', 'goober', 'groundnut', 'arachis'],
    'Tree Nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia', 'hazelnut', 'pine nut'],
    'Soy': ['soy', 'tofu', 'edamame', 'tempeh', 'miso', 'tamari'],
    'Mushrooms': ['mushroom', 'shiitake', 'portobello', 'truffle', 'porcini', 'cremini', 'enoki'],
    'Bell Peppers': ['bell pepper', 'capsicum', 'sweet pepper', 'paprika'],
    'Raw Fish': ['sushi', 'sashimi', 'raw', 'tartare', 'ceviche', 'crudo', 'poke'],
    'Very Spicy': ['spicy', 'hot', 'chili', 'jalapeno', 'habanero', 'sriracha', 'wasabi', 'cayenne']
  };

  for (const food of foodsToAvoid) {
    const keywords = avoidanceKeywords[food] || [food.toLowerCase()];
    for (const keyword of keywords) {
      if (itemContent.toLowerCase().includes(keyword.toLowerCase())) {
        return food;
      }
    }
  }

  return null;
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

  return Math.min(20, score);
};