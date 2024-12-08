import { corsHeaders } from '../_shared/cors.ts';

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: any
): Promise<{
  score: number;
  reason?: string;
  warning?: string;
  matchType: 'perfect' | 'good' | 'neutral' | 'warning';
  highlights?: string[];
}> {
  try {
    console.log('🔍 Analyzing menu item:', item.name);
    console.log('👤 User preferences:', preferences);
    
    const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
    let score = 50;
    let reasons: string[] = [];
    let warnings: string[] = [];
    let highlights: string[] = [];
    let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';

    // Critical checks (dietary restrictions) - Major negative impact
    const dietaryConflict = preferences.dietary_restrictions?.find(
      (restriction: string) => itemContent.includes(restriction.toLowerCase())
    );
    if (dietaryConflict) {
      return {
        score: 20,
        warning: `Contains ${dietaryConflict} (dietary restriction)`,
        matchType: 'warning',
        highlights: [`Contains ${dietaryConflict}`]
      };
    }

    // Favorite proteins - Major positive impact
    const proteinMatch = preferences.favorite_proteins?.find(
      (protein: string) => itemContent.includes(protein.toLowerCase())
    );
    if (proteinMatch) {
      score += 35;
      reasons.push(`Features ${proteinMatch}`);
      highlights.push(`Contains ${proteinMatch}`);
    }

    // Cuisine preferences - Significant positive impact
    const cuisineMatch = preferences.cuisine_preferences?.find(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    );
    if (cuisineMatch) {
      score += 25;
      reasons.push(`${cuisineMatch} style`);
      highlights.push(cuisineMatch);
    }

    // Foods to avoid - Moderate negative impact
    const avoidMatch = preferences.favorite_ingredients?.find(
      (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
    );
    if (avoidMatch) {
      score -= 30;
      warnings.push(`Contains ${avoidMatch} (listed in foods to avoid)`);
      highlights.push(`Contains ${avoidMatch}`);
    }

    // Atmosphere preferences - Minor positive impact
    if (preferences.atmosphere_preferences?.some(
      (pref: string) => itemContent.includes(pref.toLowerCase())
    )) {
      score += 10;
      reasons.push("Matches dining style");
    }

    // Special considerations
    if (preferences.special_considerations &&
        itemContent.includes(preferences.special_considerations.toLowerCase())) {
      score += 15;
      reasons.push("Meets special considerations");
    }

    // Determine match type based on final score
    if (score >= 90) {
      matchType = 'perfect';
    } else if (score >= 75) {
      matchType = 'good';
    } else if (score < 40) {
      matchType = 'warning';
    }

    // Cap the score at 100
    score = Math.min(100, Math.max(0, score));

    console.log(`✨ Analysis result for ${item.name}:`, {
      score,
      reasons,
      warnings,
      matchType,
      highlights
    });

    return {
      score,
      reason: reasons.length > 0 ? reasons.join(" • ") : undefined,
      warning: warnings.length > 0 ? warnings.join(" • ") : undefined,
      matchType,
      highlights: highlights.length > 0 ? highlights : undefined
    };
  } catch (error) {
    console.error('❌ Error analyzing menu item:', error);
    return { 
      score: 50,
      matchType: 'neutral'
    };
  }
}