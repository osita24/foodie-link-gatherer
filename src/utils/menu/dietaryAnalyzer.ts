import { DietaryRestriction } from './types';

export const analyzeDietaryCompliance = async (
  itemContent: string,
  userRestrictions: DietaryRestriction[],
  semanticResults: any
) => {
  console.log("🥗 Analyzing dietary compliance for:", itemContent);
  console.log("👤 User restrictions:", userRestrictions);
  
  // Check for strict dietary violations
  const strictViolations = userRestrictions
    .filter(r => r.severity === 'strict')
    .some(restriction => {
      const matchesRestriction = semanticResults.mainIngredients
        .some((ingredient: string) => 
          ingredient.toLowerCase().includes(restriction.name.toLowerCase())
        );
      
      if (matchesRestriction) {
        console.log(`❌ Found strict dietary violation: ${restriction.name}`);
        return true;
      }
      return false;
    });

  if (strictViolations) {
    console.log("🚫 Item violates strict dietary restrictions");
    return {
      compliant: false,
      score: 0,
      reason: "Violates dietary restrictions"
    };
  }

  // Score preference-based restrictions
  const preferenceViolations = userRestrictions
    .filter(r => r.severity === 'preference')
    .reduce((score, restriction) => {
      const matchesRestriction = semanticResults.mainIngredients
        .some((ingredient: string) => 
          ingredient.toLowerCase().includes(restriction.name.toLowerCase())
        );
      
      if (matchesRestriction) {
        console.log(`⚠️ Found preference violation: ${restriction.name}`);
        return score - 20;
      }
      return score;
    }, 100);

  return {
    compliant: true,
    score: Math.max(0, preferenceViolations),
    reason: preferenceViolations < 100 ? "Contains some non-preferred ingredients" : "Meets dietary preferences"
  };
};