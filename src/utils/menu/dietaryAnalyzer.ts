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

  // Enhanced high sodium detection
  const highSodiumKeywords = [
    'salty', 'brined', 'cured', 'pickled', 'soy sauce', 'fish sauce', 
    'teriyaki', 'miso', 'preserved', 'fermented', 'salt-cured',
    'nam pla', 'ponzu', 'oyster sauce', 'MSG', 'bouillon',
    'seasoning salt', 'garlic salt', 'celery salt'
  ];

  // Score preference-based restrictions
  const preferenceViolations = userRestrictions
    .filter(r => r.severity === 'preference')
    .reduce((score, restriction) => {
      // Enhanced high sodium check
      if (restriction.name === 'High Sodium') {
        const hasHighSodiumIndicators = highSodiumKeywords.some(keyword => 
          itemContent.toLowerCase().includes(keyword)
        );
        
        if (hasHighSodiumIndicators) {
          console.log("⚠️ Found multiple high sodium indicators");
          return score - 40; // Increased penalty for high sodium
        }
        return score;
      }

      const matchesRestriction = semanticResults.mainIngredients
        .some((ingredient: string) => 
          ingredient.toLowerCase().includes(restriction.name.toLowerCase())
        );
      
      if (matchesRestriction) {
        console.log(`⚠️ Found preference violation: ${restriction.name}`);
        return score - 25; // Increased penalty for preference violations
      }
      return score;
    }, 100);

  return {
    compliant: true,
    score: Math.max(0, preferenceViolations),
    reason: preferenceViolations < 100 
      ? "Contains some non-preferred ingredients" 
      : "Meets dietary preferences"
  };
};