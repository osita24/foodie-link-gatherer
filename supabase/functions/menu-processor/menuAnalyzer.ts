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
    console.log('👤 User preferences:', preferences);
    
    const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
    let score = 50;
    let reasons: string[] = [];
    let warnings: string[] = [];
    let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
    let matchStrength = '';

    // Check dietary restrictions first (critical)
    const dietaryConflicts = preferences.dietary_restrictions?.filter(
      (restriction: string) => {
        const r = restriction.toLowerCase();
        // Vegetarian check
        if (r === "vegetarian" && 
            (itemContent.includes("meat") || 
             itemContent.includes("chicken") || 
             itemContent.includes("beef") || 
             itemContent.includes("pork") ||
             itemContent.includes("fish") ||
             itemContent.includes("seafood"))) {
          return true;
        }
        // Vegan check
        if (r === "vegan" && 
            (itemContent.includes("meat") || 
             itemContent.includes("cheese") || 
             itemContent.includes("cream") || 
             itemContent.includes("milk") ||
             itemContent.includes("egg") ||
             itemContent.includes("honey") ||
             itemContent.includes("butter"))) {
          return true;
        }
        // Gluten-free check
        if (r === "gluten-free" && 
            (itemContent.includes("bread") || 
             itemContent.includes("pasta") || 
             itemContent.includes("flour") ||
             itemContent.includes("breaded") ||
             itemContent.includes("crusted") ||
             itemContent.includes("fried") ||
             itemContent.includes("wheat") ||
             itemContent.includes("soy sauce"))) {
          return true;
        }
        // Dairy-free check
        if (r === "dairy-free" && 
            (itemContent.includes("milk") || 
             itemContent.includes("cheese") || 
             itemContent.includes("cream") ||
             itemContent.includes("butter") ||
             itemContent.includes("yogurt"))) {
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

    // Check favorite proteins (major positive)
    const proteinMatches = preferences.favorite_proteins?.filter(
      (protein: string) => itemContent.includes(protein.toLowerCase())
    );
    
    if (proteinMatches?.length > 0) {
      score += 35;
      matchStrength = 'strongly';
      reasons.push(`Features ${proteinMatches[0]}, one of your favorite proteins`);
    }

    // Check cuisine preferences (significant positive)
    const cuisineMatches = preferences.cuisine_preferences?.filter(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    );
    
    if (cuisineMatches?.length > 0) {
      score += 30;
      matchStrength = matchStrength || 'highly';
      reasons.push(`Authentic ${cuisineMatches[0]} dish, matching your cuisine preferences`);
    }

    // Check spice level preferences
    if (preferences.spice_level) {
      const spiceIndicators = [
        "spicy", "hot", "chili", "jalapeño", "sriracha", 
        "wasabi", "curry", "pepper", "szechuan"
      ];
      
      const hasSpice = spiceIndicators.some(indicator => 
        itemContent.includes(indicator)
      );

      if (hasSpice) {
        if (preferences.spice_level >= 4) {
          score += 20;
          reasons.push("Spice level aligns with your preference for heat");
        } else if (preferences.spice_level <= 2) {
          score -= 25;
          warnings.push("May be too spicy based on your preferences");
        }
      }
    }

    // Check ingredients to avoid
    const ingredientsToAvoid = preferences.favorite_ingredients?.filter(
      (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
    );
    
    if (ingredientsToAvoid?.length > 0) {
      score -= 35;
      warnings.push(`Contains ${ingredientsToAvoid[0]}, which you prefer to avoid`);
    }

    // Analyze cooking methods and ingredients for health-conscious preferences
    const healthyIndicators = {
      "grilled": "Healthy grilled preparation",
      "steamed": "Light steamed preparation",
      "baked": "Oven-baked preparation",
      "fresh": "Made with fresh ingredients",
      "organic": "Uses organic ingredients",
      "seasonal": "Features seasonal ingredients",
      "local": "Made with local ingredients",
      "house-made": "Freshly prepared in-house",
      "wild-caught": "Wild-caught seafood",
      "grass-fed": "Quality grass-fed meat",
      "farm-to-table": "Farm-to-table ingredients"
    };

    for (const [indicator, reason] of Object.entries(healthyIndicators)) {
      if (itemContent.includes(indicator)) {
        score += 10;
        reasons.push(reason);
        break; // Only add one health indicator reason
      }
    }

    // Special dish indicators
    const specialIndicators = {
      "signature": "Chef's signature creation",
      "award-winning": "Award-winning dish",
      "house specialty": "Restaurant specialty",
      "traditional": "Authentic traditional recipe",
      "popular": "Customer favorite"
    };

    for (const [indicator, reason] of Object.entries(specialIndicators)) {
      if (itemContent.includes(indicator)) {
        score += 5;
        reasons.push(reason);
        break; // Only add one special indicator reason
      }
    }

    // If still no specific reasons, analyze the dish type
    if (reasons.length === 0 && warnings.length === 0) {
      const dishTypes = {
        "appetizer": "Light starter option",
        "salad": "Fresh salad selection",
        "soup": "Warming soup option",
        "main": "Main course selection",
        "dessert": "Sweet dessert option",
        "side": "Complementary side dish"
      };

      for (const [type, reason] of Object.entries(dishTypes)) {
        if (itemContent.includes(type)) {
          reasons.push(reason);
          break;
        }
      }

      // If still no reason, provide a generic but informative reason
      if (reasons.length === 0) {
        reasons.push("Standard menu item - neutral match with your preferences");
      }
    }

    // Determine match type based on final score and context
    if (score >= 90) {
      matchType = 'perfect';
      if (!reasons[0].includes('perfect')) {
        reasons[0] = `Perfect match: ${reasons[0]}`;
      }
    } else if (score >= 75) {
      matchType = 'good';
      if (!reasons[0].includes('great')) {
        reasons[0] = `Great choice: ${reasons[0]}`;
      }
    } else if (score < 40 && warnings.length > 0) {
      matchType = 'warning';
    } else {
      // Make neutral matches more informative
      if (reasons[0] && !reasons[0].includes('Consider')) {
        reasons[0] = `Consider this option: ${reasons[0]}`;
      }
    }

    // Cap the score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    console.log(`✨ Analysis result for ${item.name}:`, {
      score,
      reasons,
      warnings,
      matchType
    });

    return {
      score,
      reason: reasons.length > 0 ? reasons[0] : undefined,
      warning: warnings.length > 0 ? warnings[0] : undefined,
      matchType
    };
  } catch (error) {
    console.error('❌ Error analyzing menu item:', error);
    return { 
      score: 50,
      matchType: 'neutral',
      reason: "Could not analyze this item"
    };
  }
}