interface IngredientMatch {
  conflicts: string[];
  score: number;
}

const commonIngredients: Record<string, string[]> = {
  'mushrooms': ['mushroom', 'portobello', 'shiitake', 'truffle'],
  'bell peppers': ['pepper', 'capsicum', 'paprika'],
  'shellfish': ['shrimp', 'prawn', 'lobster', 'crab', 'scallop', 'mussel', 'clam', 'oyster'],
  'peanuts': ['peanut', 'goober', 'groundnut'],
  'tree nuts': ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'macadamia'],
  'soy': ['soy', 'edamame', 'tofu'],
  'raw fish': ['sashimi', 'crudo', 'tartare', 'ceviche', 'poke'],
  'very spicy': ['spicy', 'hot', 'chili', 'jalapeno', 'habanero', 'sriracha', 'wasabi']
};

export function analyzeIngredients(
  itemContent: string,
  foodsToAvoid: string[]
): IngredientMatch {
  console.log('🥕 Analyzing ingredients for:', itemContent);
  console.log('👤 User foods to avoid:', foodsToAvoid);

  const conflicts: string[] = [];
  
  for (const ingredient of foodsToAvoid) {
    const ingredientLower = ingredient.toLowerCase();
    if (ingredientLower === 'no restrictions') continue;

    const termsToCheck = commonIngredients[ingredientLower] || [ingredientLower];
    const found = termsToCheck.some(term => 
      itemContent.toLowerCase().includes(term)
    );

    if (found) {
      conflicts.push(ingredient);
      console.log(`⚠️ Found avoided ingredient: ${ingredient}`);
    }
  }

  // Penalty score based on conflicts (-25 points per conflict, max -50)
  const score = Math.max(-50, conflicts.length * -25);
  
  return { conflicts, score };
}