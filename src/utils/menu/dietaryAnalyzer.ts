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
      const content = itemContent.toLowerCase();
      
      // Vegetarian check
      if (restrictionName === 'vegetarian') {
        // First check if explicitly marked as vegetarian/veggie
        if (content.includes('vegetarian') || content.includes('veggie')) {
          return null; // Explicitly vegetarian items are always compliant
        }

        const meatKeywords = [
          'beef', 'chicken', 'pork', 'fish', 'seafood', 'lamb', 
          'turkey', 'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni', 
          'anchovy', 'duck', 'veal', 'foie gras', 'chorizo', 'sausage',
          'meatball', 'steak', 'tuna', 'shrimp', 'crab', 'lobster'
        ];
        
        // Check for meat keywords but exclude "veggie burger", "plant-based burger" etc
        if (meatKeywords.some(keyword => {
          const keywordIndex = content.indexOf(keyword);
          if (keywordIndex === -1) return false;
          
          const nearbyText = content.slice(Math.max(0, keywordIndex - 20), 
                                        keywordIndex + keyword.length + 20);
          return !nearbyText.includes('veggie') && 
                 !nearbyText.includes('vegetarian') && 
                 !nearbyText.includes('plant-based') &&
                 !nearbyText.includes('meat-free');
        })) {
          return "Contains meat products - not suitable for vegetarians";
        }
        return null;
      }
      
      // Vegan check
      if (restrictionName === 'vegan') {
        if (content.includes('vegan')) return null; // Explicitly vegan items are compliant
        
        const nonVeganKeywords = [
          'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb',
          'cheese', 'cream', 'milk', 'egg', 'butter', 'honey', 'yogurt',
          'mayo', 'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni',
          'anchovy', 'duck', 'veal', 'foie gras', 'chorizo', 'sausage',
          'gelatin', 'whey', 'casein', 'ghee', 'lard', 'aioli',
          'parmesan', 'mozzarella', 'cheddar'
        ];
        
        const foundNonVegan = nonVeganKeywords.find(keyword => {
          const keywordIndex = content.indexOf(keyword);
          if (keywordIndex === -1) return false;
          
          const nearbyText = content.slice(Math.max(0, keywordIndex - 20), 
                                        keywordIndex + keyword.length + 20);
          return !nearbyText.includes('vegan') && 
                 !nearbyText.includes('plant-based') &&
                 !nearbyText.includes('dairy-free');
        });

        if (foundNonVegan) {
          return `Contains ${foundNonVegan} - not suitable for vegans`;
        }
        return null;
      }
      
      // Gluten-free check
      if (restrictionName === 'gluten-free') {
        if (content.includes('gluten-free') || content.includes('gf')) return null;
        
        const glutenKeywords = [
          'bread', 'pasta', 'flour', 'wheat', 'tortilla', 'breaded',
          'crusted', 'battered', 'soy sauce', 'teriyaki', 'noodles',
          'ramen', 'udon', 'couscous', 'barley', 'malt', 'seitan'
        ];
        
        const foundGluten = glutenKeywords.find(keyword => content.includes(keyword));
        if (foundGluten) {
          return `Contains ${foundGluten} - not gluten-free`;
        }
        return null;
      }

      return null;
    })
    .filter(Boolean);

  if (strictViolations.length > 0) {
    console.log("🚫 Item violates strict dietary restrictions:", strictViolations[0]);
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
      
      if (restrictionName === 'low-sodium' && 
          semanticResults.mainIngredients.includes('highSodium')) {
        score -= 30;
        reasons.push("High sodium content");
      }

      if (restrictionName === 'low-oil' && 
          (semanticResults.prepMethod === 'fried' || 
           semanticResults.mainIngredients.includes('oily'))) {
        score -= 25;
        reasons.push("Contains fried/oily ingredients");
      }
    });

  // Add positive dietary indicators
  if (itemContent.toLowerCase().includes('vegetarian')) {
    score = Math.min(100, score + 20);
    reasons.push("Vegetarian-friendly option");
  }

  if (itemContent.toLowerCase().includes('vegan')) {
    score = Math.min(100, score + 20);
    reasons.push("Vegan-friendly option");
  }

  if (itemContent.toLowerCase().includes('gluten-free')) {
    score = Math.min(100, score + 20);
    reasons.push("Gluten-free option");
  }

  return {
    compliant: true,
    score: Math.max(0, score),
    reason: reasons.join("; ") || "Meets your dietary preferences"
  };
};