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
    let score = 50; // Start with neutral score
    let reasons: string[] = [];
    let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';

    // Critical checks (dietary restrictions) - Major negative impact
    if (preferences.dietary_restrictions?.some(
      (restriction: string) => itemContent.includes(restriction.toLowerCase())
    )) {
      return {
        score: 20,
        warning: "Contains ingredients you typically avoid",
        matchType: 'warning'
      };
    }

    // Favorite proteins - Major positive impact
    const proteinMatch = preferences.favorite_proteins?.find(
      (protein: string) => itemContent.includes(protein.toLowerCase())
    );
    if (proteinMatch) {
      score += 35;
      reasons.push(`Contains ${proteinMatch}`);
    }

    // Cuisine preferences - Significant positive impact
    const cuisineMatch = preferences.cuisine_preferences?.find(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    );
    if (cuisineMatch) {
      score += 25;
      reasons.push(`Matches ${cuisineMatch} cuisine`);
    }

    // Favorite ingredients - Moderate positive impact
    const ingredientMatch = preferences.favorite_ingredients?.find(
      (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
    );
    if (ingredientMatch) {
      score += 15;
      reasons.push(`Contains ${ingredientMatch}`);
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
    score = Math.min(100, score);

    console.log(`✨ Analysis result for ${item.name}:`, {
      score,
      reasons,
      matchType
    });

    return {
      score,
      reason: reasons.length > 0 ? reasons.join(" • ") : undefined,
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