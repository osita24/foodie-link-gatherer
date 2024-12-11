import { DietaryRestriction } from './types';

export const analyzeDietaryCompliance = async (
  itemContent: string,
  userRestrictions: DietaryRestriction[],
  semanticResults: any
) => {
  console.log("🥗 Analyzing dietary compliance for:", itemContent);
  console.log("👤 User restrictions:", userRestrictions);
  
  // Critical dietary checks
  const hasStrictViolation = userRestrictions
    .filter(r => r.severity === 'strict')
    .some(restriction => {
      const restrictionName = restriction.name.toLowerCase();
      
      // Vegetarian check
      if (restrictionName === 'vegetarian' && 
          (semanticResults.mainIngredients.includes('meat') || 
           semanticResults.mainIngredients.includes('seafood'))) {
        console.log("❌ Non-vegetarian item detected");
        return true;
      }
      
      // Vegan check
      if (restrictionName === 'vegan' && 
          (semanticResults.mainIngredients.includes('meat') || 
           semanticResults.mainIngredients.includes('seafood') ||
           semanticResults.mainIngredients.includes('dairy') ||
           semanticResults.mainIngredients.includes('eggs'))) {
        console.log("❌ Non-vegan item detected");
        return true;
      }
      
      // Gluten-free check
      if (restrictionName === 'gluten-free' && 
          semanticResults.mainIngredients.includes('gluten')) {
        console.log("❌ Contains gluten");
        return true;
      }

      return false;
    });

  if (hasStrictViolation) {
    console.log("🚫 Item violates strict dietary restrictions");
    return {
      compliant: false,
      score: 0,
      reason: "Contains ingredients that don't match your dietary preferences"
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
        reasons.push("High sodium content");
      }
    });

  // Boost score for explicitly marked items
  if (userRestrictions.some(r => r.name.toLowerCase() === 'vegetarian') && 
      semanticResults.mainIngredients.includes('vegetarian')) {
    score = Math.min(100, score + 20);
    reasons.push("Marked as vegetarian");
  }

  if (userRestrictions.some(r => r.name.toLowerCase() === 'vegan') && 
      semanticResults.mainIngredients.includes('vegan')) {
    score = Math.min(100, score + 20);
    reasons.push("Marked as vegan");
  }

  return {
    compliant: true,
    score: Math.max(0, score),
    reason: reasons.join(", ") || "Meets dietary preferences"
  };
};