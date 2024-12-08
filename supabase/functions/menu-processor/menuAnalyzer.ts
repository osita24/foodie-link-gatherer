import { corsHeaders } from '../_shared/cors.ts';

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: any
): Promise<{
  score: number;
  reason?: string;
  warning?: string;
  matchType?: 'perfect' | 'good' | 'neutral' | 'warning';
}> {
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
        if (restriction === "No Restrictions") return false;
        return itemContent.includes(restriction.toLowerCase());
      }
    );

    if (dietaryConflicts?.length > 0) {
      return {
        score: 20,
        warning: `Contains ${dietaryConflicts.join(", ")}`,
        matchType: 'warning'
      };
    }

    // Check favorite proteins (major positive)
    const proteinMatches = preferences.favorite_proteins?.filter(
      (protein: string) => {
        if (protein === "Doesn't Apply") return false;
        return itemContent.includes(protein.toLowerCase());
      }
    );
    
    if (proteinMatches?.length > 0) {
      score += 25;
      reasons.push(`Contains ${proteinMatches.join(", ")}`);
    }

    // Check cuisine preferences (significant positive)
    const cuisineMatches = preferences.cuisine_preferences?.filter(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    );
    
    if (cuisineMatches?.length > 0) {
      score += 20;
      reasons.push(`Matches ${cuisineMatches[0]} cuisine`);
    }

    // Check foods to avoid (negative impact)
    const avoidanceMatches = preferences.favorite_ingredients?.filter(
      (ingredient: string) => {
        if (ingredient === "No Restrictions") return false;
        return itemContent.includes(ingredient.toLowerCase());
      }
    );
    
    if (avoidanceMatches?.length > 0) {
      score -= 30;
      warnings.push(`Contains ${avoidanceMatches.join(", ")}`);
    }

    // Determine match type based on final score
    if (score >= 85) {
      matchType = 'perfect';
    } else if (score >= 70) {
      matchType = 'good';
    } else if (score < 50) {
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
      reason: reasons.length > 0 ? reasons.join(" • ") : undefined,
      warning: warnings.length > 0 ? warnings.join(" • ") : undefined,
      matchType
    };
  } catch (error) {
    console.error('❌ Error analyzing menu item:', error);
    return { 
      score: 50,
      matchType: 'neutral'
    };
  }
}