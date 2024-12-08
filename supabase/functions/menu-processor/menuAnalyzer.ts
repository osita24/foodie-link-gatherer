import { corsHeaders } from '../_shared/cors.ts';

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: any
): Promise<{
  score: number;
  reason?: string;
  warning?: string;
  matchType?: 'perfect' | 'good' | 'neutral' | 'warning';
  highlights?: string[];
  considerations?: string[];
}> {
  try {
    console.log('🔍 Analyzing menu item:', item.name);
    console.log('👤 User preferences:', preferences);
    
    const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
    let score = 50;
    let highlights: string[] = [];
    let considerations: string[] = [];

    // Check for dietary restrictions (Critical)
    const dietaryConflict = preferences.dietary_restrictions?.find(
      (restriction: string) => itemContent.includes(restriction.toLowerCase())
    );
    if (dietaryConflict) {
      return {
        score: 25,
        warning: `Contains ${dietaryConflict}`,
        matchType: 'warning',
        considerations: [`May not be suitable due to ${dietaryConflict}`]
      };
    }

    // Check for favorite proteins (Major boost)
    const proteinMatch = preferences.favorite_proteins?.find(
      (protein: string) => itemContent.includes(protein.toLowerCase())
    );
    if (proteinMatch) {
      score += 30;
      highlights.push(`Features ${proteinMatch}`);
    }

    // Check cuisine preferences (Significant boost)
    const cuisineMatch = preferences.cuisine_preferences?.find(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    );
    if (cuisineMatch) {
      score += 20;
      highlights.push(`${cuisineMatch} style`);
    }

    // Check for foods to avoid (Major reduction)
    const avoidedIngredient = preferences.foodsToAvoid?.find(
      (food: string) => itemContent.includes(food.toLowerCase())
    );
    if (avoidedIngredient) {
      score -= 25;
      considerations.push(`Contains ${avoidedIngredient}`);
    }

    // Determine match type and prepare response
    let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
    if (score >= 90) matchType = 'perfect';
    else if (score >= 75) matchType = 'good';
    else if (score < 40) matchType = 'warning';

    return {
      score: Math.min(100, Math.max(0, score)),
      matchType,
      highlights: highlights.length > 0 ? highlights : undefined,
      considerations: considerations.length > 0 ? considerations : undefined,
      reason: highlights.length > 0 ? highlights.join(" • ") : undefined,
      warning: considerations.length > 0 ? considerations.join(" • ") : undefined
    };
  } catch (error) {
    console.error('❌ Error analyzing menu item:', error);
    return { 
      score: 50, 
      matchType: 'neutral',
      reason: "Basic recommendation"
    };
  }
}