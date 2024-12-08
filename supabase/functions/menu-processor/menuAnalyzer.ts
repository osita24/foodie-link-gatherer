import { corsHeaders } from '../_shared/cors.ts';

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: any
): Promise<{
  score: number;
  reason?: string;
  warning?: string;
}> {
  try {
    console.log('🔍 Analyzing menu item:', item.name);
    console.log('👤 User preferences:', preferences);
    
    const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
    let score = 50; // Start with neutral score

    // Critical checks (dietary restrictions) - Major negative impact
    if (preferences.dietary_restrictions?.some(
      (restriction: string) => itemContent.includes(restriction.toLowerCase())
    )) {
      return {
        score: 20,
        warning: "Contains ingredients you typically avoid"
      };
    }

    // Favorite proteins - Major positive impact
    if (preferences.favorite_proteins?.some(
      (protein: string) => itemContent.includes(protein.toLowerCase())
    )) {
      score += 35;
      return {
        score: Math.min(95, score),
        reason: "Contains your favorite protein!"
      };
    }

    // Cuisine preferences - Moderate positive impact
    if (preferences.cuisine_preferences?.some(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    )) {
      score += 25;
      return {
        score: Math.min(90, score),
        reason: "Matches your preferred cuisine style!"
      };
    }

    // Foods to avoid - Moderate negative impact
    if (preferences.foodsToAvoid?.some(
      (food: string) => itemContent.includes(food.toLowerCase())
    )) {
      score -= 20;
      return {
        score: Math.max(30, score),
        warning: "Contains ingredients you prefer to avoid"
      };
    }

    // Atmosphere match - Small positive impact
    if (preferences.atmosphere_preferences?.some(
      (atmosphere: string) => itemContent.includes(atmosphere.toLowerCase())
    )) {
      score += 10;
    }

    // Default moderate score with no strong matches/mismatches
    return { 
      score: score,
      reason: score > 70 ? "This could be a good match based on your preferences" : undefined
    };

  } catch (error) {
    console.error('❌ Error analyzing menu item:', error);
    return { score: 50 };
  }
}