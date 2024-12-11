import { DietaryRestriction } from './types';

export const analyzeDietaryCompliance = async (
  itemContent: string,
  userRestrictions: DietaryRestriction[],
  semanticResults: any
) => {
  console.log("🥗 Analyzing dietary compliance for:", itemContent);
  console.log("👤 User restrictions:", userRestrictions);
  
  // Critical dietary checks
  const strictViolations = userRestrictions
    .filter(r => r.severity === 'strict')
    .map(restriction => {
      const restrictionName = restriction.name.toLowerCase();
      
      // Vegetarian check
      if (restrictionName === 'vegetarian' && 
          (semanticResults.mainIngredients.includes('meat') || 
           semanticResults.mainIngredients.includes('seafood'))) {
        return "Contains meat/seafood - not suitable for vegetarians";
      }
      
      // Vegan check
      if (restrictionName === 'vegan' && 
          (semanticResults.mainIngredients.includes('meat') || 
           semanticResults.mainIngredients.includes('seafood') ||
           semanticResults.mainIngredients.includes('dairy') ||
           semanticResults.mainIngredients.includes('eggs'))) {
        const animalProducts = [];
        if (semanticResults.mainIngredients.includes('meat')) animalProducts.push('meat');
        if (semanticResults.mainIngredients.includes('seafood')) animalProducts.push('seafood');
        if (semanticResults.mainIngredients.includes('dairy')) animalProducts.push('dairy');
        if (semanticResults.mainIngredients.includes('eggs')) animalProducts.push('eggs');
        return `Contains ${animalProducts.join(', ')} - not suitable for vegans`;
      }
      
      // Gluten-free check
      if (restrictionName === 'gluten-free' && 
          semanticResults.mainIngredients.includes('gluten')) {
        return "Contains gluten - not gluten-free";
      }

      return null;
    })
    .filter(Boolean);

  if (strictViolations.length > 0) {
    console.log("🚫 Item violates strict dietary restrictions");
    return {
      compliant: false,
      score: 0,
      reason: strictViolations[0]
    };
  }

  // Score preference-based restrictions
  let score = 100;
  let reasons: string[] = [];

  userRestrictions
    .filter(r => r.severity === 'preference')
    .forEach(restriction => {
      const restrictionName = restriction.name.toLowerCase();
      
      if (restrictionName === 'high sodium' && 
          semanticResults.mainIngredients.includes('highSodium')) {
        score -= 30;
        reasons.push("High sodium content - may not align with your low-sodium preference");
      }

      if (restrictionName === 'oily foods' && 
          (semanticResults.prepMethod === 'fried' || 
           semanticResults.mainIngredients.includes('oily'))) {
        score -= 25;
        reasons.push("Fried/oily preparation - consider a grilled alternative");
      }

      if (restrictionName === 'spicy foods' && 
          semanticResults.mainIngredients.includes('spicy')) {
        score -= 25;
        reasons.push("Contains spicy ingredients - may be too hot for your preference");
      }
    });

  // Boost score for explicitly marked items
  if (userRestrictions.some(r => r.name.toLowerCase() === 'vegetarian') && 
      semanticResults.mainIngredients.includes('vegetarian')) {
    score = Math.min(100, score + 20);
    reasons.push("Explicitly marked as vegetarian");
  }

  if (userRestrictions.some(r => r.name.toLowerCase() === 'vegan') && 
      semanticResults.mainIngredients.includes('vegan')) {
    score = Math.min(100, score + 20);
    reasons.push("Explicitly marked as vegan");
  }

  return {
    compliant: true,
    score: Math.max(0, score),
    reason: reasons.join("; ") || "Meets your dietary preferences"
  };
};