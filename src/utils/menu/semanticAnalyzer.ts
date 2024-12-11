export const analyzeDishSemantics = async (itemContent: string) => {
  console.log("🔍 Analyzing dish semantics for:", itemContent);
  
  // Simple keyword-based analysis instead of ML
  const content = itemContent.toLowerCase();
  
  // Basic preparation method detection
  const prepMethods = {
    fried: content.includes('fried') || content.includes('crispy'),
    grilled: content.includes('grilled') || content.includes('charred'),
    baked: content.includes('baked') || content.includes('roasted'),
    steamed: content.includes('steamed'),
    raw: content.includes('raw') || content.includes('sashimi')
  };

  // Basic ingredient detection
  const ingredients = {
    meat: content.includes('meat') || content.includes('beef') || content.includes('pork'),
    dairy: content.includes('cheese') || content.includes('milk') || content.includes('cream'),
    gluten: content.includes('bread') || content.includes('pasta') || content.includes('flour'),
    nuts: content.includes('nut') || content.includes('almond') || content.includes('cashew'),
    seafood: content.includes('fish') || content.includes('shrimp') || content.includes('seafood'),
    eggs: content.includes('egg'),
    vegetarian: content.includes('vegetarian') || (!content.includes('meat') && !content.includes('fish')),
    vegan: content.includes('vegan')
  };

  // Basic cuisine type detection
  const cuisineKeywords = {
    Italian: ['pasta', 'pizza', 'risotto'],
    Asian: ['soy', 'wok', 'stir-fry', 'teriyaki'],
    Mexican: ['taco', 'burrito', 'salsa'],
    Mediterranean: ['hummus', 'falafel', 'pita'],
    American: ['burger', 'fries', 'steak']
  };

  let detectedCuisine = 'Other';
  for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      detectedCuisine = cuisine;
      break;
    }
  }

  console.log("✨ Basic semantic analysis results:", {
    prepMethods,
    ingredients,
    detectedCuisine
  });

  return {
    prepMethod: Object.entries(prepMethods).find(([_, value]) => value)?.[0] || 'unknown',
    prepScore: 0.8,
    mainIngredients: Object.entries(ingredients)
      .filter(([_, value]) => value)
      .map(([key]) => key),
    cuisineType: detectedCuisine,
    cuisineScore: 0.7
  };
};