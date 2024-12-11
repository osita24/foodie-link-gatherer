export const analyzeDishSemantics = async (itemContent: string) => {
  console.log("🔍 Analyzing dish semantics for:", itemContent);
  
  const content = itemContent.toLowerCase();
  
  // Analyze preparation method
  const prepMethods = {
    fried: content.includes('fried') || content.includes('crispy'),
    grilled: content.includes('grilled') || content.includes('char'),
    baked: content.includes('baked') || content.includes('roasted'),
    steamed: content.includes('steamed'),
    raw: content.includes('raw') || content.includes('sushi')
  };

  const prepMethod = Object.entries(prepMethods)
    .find(([_, isPresent]) => isPresent)?.[0] || 'unknown';

  // Analyze main ingredients
  const ingredients = {
    meat: content.includes('beef') || content.includes('burger') || 
          content.includes('bacon') || content.includes('pork') || 
          content.includes('ham') || content.includes('steak'),
    dairy: content.includes('cheese') || content.includes('milk') || 
          content.includes('cream') || content.includes('butter') ||
          content.includes('yogurt'),
    gluten: content.includes('bread') || content.includes('bun') || 
           content.includes('pasta') || content.includes('flour') ||
           content.includes('wheat'),
    nuts: content.includes('nut') || content.includes('almond') || 
          content.includes('cashew') || content.includes('peanut'),
    seafood: content.includes('fish') || content.includes('shrimp') || 
            content.includes('seafood') || content.includes('tuna'),
    eggs: content.includes('egg') || content.includes('mayo'),
    vegetarian: content.includes('veggie') || content.includes('vegetarian'),
    vegan: content.includes('vegan') || content.includes('plant-based'),
    highSodium: content.includes('salt') || content.includes('soy sauce') || 
                content.includes('teriyaki') || content.includes('bbq') ||
                content.includes('bacon') || content.includes('gravy')
  };

  // Analyze cuisine type
  const cuisineKeywords = {
    'Italian': ['pasta', 'pizza', 'italian'],
    'Asian': ['sushi', 'stir-fry', 'asian', 'teriyaki'],
    'Mexican': ['taco', 'burrito', 'mexican'],
    'Mediterranean': ['hummus', 'falafel', 'mediterranean'],
    'American': ['burger', 'fries', 'american']
  };

  const cuisineType = Object.entries(cuisineKeywords)
    .find(([_, keywords]) => keywords.some(keyword => content.includes(keyword)))?.[0] || 'Other';

  console.log("✨ Semantic analysis results:", {
    prepMethod,
    ingredients,
    cuisineType
  });

  return {
    prepMethod,
    prepScore: 1.0,
    mainIngredients: Object.entries(ingredients)
      .filter(([_, isPresent]) => isPresent)
      .map(([name]) => name),
    cuisineType,
    cuisineScore: 1.0
  };
};