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
             itemContent.includes("breaded") ||
             itemContent.includes("fried"))) {
          return true;
        }
        return itemContent.includes(r);
      }
    );

    if (dietaryConflicts?.length > 0) {
      return {
        score: 20,
        warning: `Not suitable for ${dietaryConflicts[0]} diet`,
        matchType: 'warning'
      };
    }

    // Check favorite proteins (major positive)
    const proteinMatches = preferences.favorite_proteins?.filter(
      (protein: string) => itemContent.includes(protein.toLowerCase())
    );
    
    if (proteinMatches?.length > 0) {
      score += 30;
      reasons.push(`Features your favorite protein: ${proteinMatches[0]}`);
    }

    // Check cuisine preferences (significant positive)
    const cuisineMatches = preferences.cuisine_preferences?.filter(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    );
    
    if (cuisineMatches?.length > 0) {
      score += 25;
      reasons.push(`Authentic ${cuisineMatches[0]} cuisine style`);
    }

    // Check spice level preferences
    if (preferences.spice_level) {
      if (itemContent.includes("spicy") || 
          itemContent.includes("hot") || 
          itemContent.includes("chili") ||
          itemContent.includes("jalapeño")) {
        if (preferences.spice_level >= 4) {
          score += 15;
          reasons.push("Matches your spice preference");
        } else {
          score -= 15;
          warnings.push("May be too spicy for your taste");
        }
      }
    }

    // Check ingredients to avoid
    const ingredientsToAvoid = preferences.favorite_ingredients?.filter(
      (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
    );
    
    if (ingredientsToAvoid?.length > 0) {
      score -= 30;
      warnings.push(`Contains ${ingredientsToAvoid[0]} which you prefer to avoid`);
    }

    // Add specific neutral reasons if no matches found
    if (reasons.length === 0 && warnings.length === 0) {
      if (itemContent.includes("vegetarian") || itemContent.includes("vegan")) {
        reasons.push("Plant-based dish available");
      } else if (itemContent.includes("grilled")) {
        reasons.push("Healthy grilled preparation");
      } else if (itemContent.includes("fresh") || itemContent.includes("seasonal")) {
        reasons.push("Made with fresh, seasonal ingredients");
      } else if (itemContent.includes("house") || itemContent.includes("signature")) {
        reasons.push("Chef's signature dish");
      } else if (itemContent.includes("local") || itemContent.includes("artisan")) {
        reasons.push("Features local/artisanal ingredients");
      } else if (itemContent.includes("organic")) {
        reasons.push("Made with organic ingredients");
      } else if (itemContent.includes("gluten-free")) {
        reasons.push("Gluten-free option available");
      } else if (itemContent.includes("traditional") || itemContent.includes("classic")) {
        reasons.push("Classic preparation style");
      } else {
        reasons.push("Standard menu item");
      }
    }

    // Determine match type based on final score
    if (score >= 90) {
      matchType = 'perfect';
    } else if (score >= 75) {
      matchType = 'good';
    } else if (score < 40 && warnings.length > 0) {
      matchType = 'warning';
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