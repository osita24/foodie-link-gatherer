import { corsHeaders } from '../_shared/cors.ts';

interface AnalysisResult {
  score: number;
  reason?: string;
  warning?: string;
  matchType: 'perfect' | 'good' | 'neutral' | 'warning';
}

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: any
): Promise<AnalysisResult> {
  try {
    console.log('🔍 Analyzing menu item:', item.name);
    
    const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
    let score = 50;
    let reasons: string[] = [];
    let warnings: string[] = [];
    let matchStrength = '';

    // Check dietary restrictions first (critical)
    const dietaryConflicts = preferences.dietary_restrictions?.filter(
      (restriction: string) => {
        const r = restriction.toLowerCase();
        if (r === "vegetarian" && 
            (itemContent.includes("meat") || 
             itemContent.includes("chicken") || 
             itemContent.includes("beef") || 
             itemContent.includes("pork") ||
             itemContent.includes("fish"))) {
          return true;
        }
        if (r === "vegan" && 
            (itemContent.includes("meat") || 
             itemContent.includes("cheese") || 
             itemContent.includes("cream") || 
             itemContent.includes("milk") ||
             itemContent.includes("egg"))) {
          return true;
        }
        if (r === "gluten-free" && 
            (itemContent.includes("bread") || 
             itemContent.includes("pasta") || 
             itemContent.includes("flour") ||
             itemContent.includes("tortilla"))) {
          return true;
        }
        return itemContent.includes(r);
      }
    );

    if (dietaryConflicts?.length > 0) {
      return {
        score: 20,
        warning: `Not suitable for your ${dietaryConflicts[0]} dietary requirement`,
        matchType: 'warning'
      };
    }

    // Check cuisine match (major positive)
    const cuisineMatches = preferences.cuisine_preferences?.filter(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    );
    
    if (cuisineMatches?.length > 0) {
      score += 35;
      matchStrength = 'strongly';
      reasons.push(`Authentic ${cuisineMatches[0]} dish that matches your taste`);
    }

    // Check favorite proteins (significant positive)
    const proteinMatches = preferences.favorite_proteins?.filter(
      (protein: string) => itemContent.includes(protein.toLowerCase())
    );
    
    if (proteinMatches?.length > 0) {
      score += 30;
      matchStrength = matchStrength || 'highly';
      reasons.push(`Features ${proteinMatches[0]}, one of your preferred proteins`);
    }

    // Check favorite ingredients (positive)
    const ingredientMatches = preferences.favorite_ingredients?.filter(
      (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
    );

    if (ingredientMatches?.length > 0) {
      score += 20;
      reasons.push(`Contains ${ingredientMatches[0]}, which you love`);
    }

    // Analyze cooking methods and ingredients for health-conscious preferences
    const healthyIndicators = {
      "grilled": "Healthy grilled preparation, perfect for clean eating",
      "steamed": "Light and healthy steamed preparation",
      "baked": "Oven-baked for a healthier option",
      "fresh": "Made with fresh, high-quality ingredients",
      "organic": "Features organic ingredients",
      "seasonal": "Made with seasonal ingredients at peak freshness",
      "local": "Sourced from local ingredients",
      "house-made": "Freshly prepared in-house with care",
      "wild-caught": "Premium wild-caught seafood",
      "grass-fed": "Quality grass-fed meat"
    };

    for (const [indicator, reason] of Object.entries(healthyIndicators)) {
      if (itemContent.includes(indicator)) {
        score += 15;
        reasons.push(reason);
        break;
      }
    }

    // Special dish indicators
    if (itemContent.includes("signature") || itemContent.includes("special")) {
      score += 10;
      reasons.push("Chef's special creation, highly recommended");
    } else if (itemContent.includes("popular") || itemContent.includes("favorite")) {
      score += 5;
      reasons.push("Customer favorite dish");
    }

    // If no specific matches found, analyze dish components
    if (reasons.length === 0) {
      if (itemContent.includes("salad")) {
        reasons.push("Fresh and healthy salad option");
      } else if (itemContent.includes("soup")) {
        reasons.push("Comforting homemade soup");
      } else if (itemContent.includes("bowl")) {
        reasons.push("Nutritious and filling bowl");
      } else {
        reasons.push("Classic dish worth trying");
      }
    }

    // Determine match type based on final score
    let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
    if (score >= 90) {
      matchType = 'perfect';
      if (!reasons[0].includes('Perfect')) {
        reasons[0] = `Perfect match: ${reasons[0]}`;
      }
    } else if (score >= 75) {
      matchType = 'good';
      if (!reasons[0].includes('Great')) {
        reasons[0] = `Great choice: ${reasons[0]}`;
      }
    }

    // Cap score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      reason: reasons[0],
      matchType
    };
  } catch (error) {
    console.error('❌ Error analyzing menu item:', error);
    return { 
      score: 50,
      matchType: 'neutral',
      reason: "Interesting menu item worth exploring"
    };
  }
}