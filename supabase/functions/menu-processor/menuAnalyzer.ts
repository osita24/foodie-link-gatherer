import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: any,
  openAIKey: string
): Promise<{
  score: number;
  reason?: string;
  warning?: string;
}> {
  try {
    console.log('🔍 Analyzing menu item:', item.name);
    
    const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
    let score = 50; // Start with a neutral score
    let reasons: string[] = [];
    let warnings: string[] = [];

    // Critical checks (dietary restrictions) - These can severely lower the score
    if (preferences.dietary_restrictions?.some(
      (restriction: string) => itemContent.includes(restriction.toLowerCase())
    )) {
      return {
        score: 20,
        warning: "Contains ingredients you avoid"
      };
    }

    // Positive factors that can boost the score
    // Check favorite proteins (major boost)
    if (preferences.favorite_proteins?.some(
      (protein: string) => itemContent.includes(protein.toLowerCase())
    )) {
      score += 30;
      reasons.push("Contains your favorite protein!");
    }

    // Check cuisine preferences (moderate boost)
    if (preferences.cuisine_preferences?.some(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    )) {
      score += 20;
      reasons.push("Matches your preferred cuisine!");
    }

    // Check favorite ingredients (small boost)
    if (preferences.favorite_ingredients?.some(
      (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
    )) {
      score += 15;
      reasons.push("Contains ingredients you love!");
    }

    // Negative factors that can lower the score
    // Check for common allergens if user has specified any
    if (preferences.foodsToAvoid?.some(
      (food: string) => itemContent.includes(food.toLowerCase())
    )) {
      score -= 25;
      warnings.push("Contains ingredients you prefer to avoid");
    }

    // Spice level compatibility
    if (preferences.spiceLevel) {
      if (itemContent.includes('spicy') || itemContent.includes('hot')) {
        if (preferences.spiceLevel < 3) {
          score -= 15;
          warnings.push("May be too spicy based on your preferences");
        } else if (preferences.spiceLevel > 3) {
          score += 15;
          reasons.push("Matches your spice preference!");
        }
      }
    }

    // Ensure score stays within bounds
    score = Math.max(20, Math.min(95, score));

    // Return the most relevant reason or warning
    return {
      score,
      reason: reasons.length > 0 ? reasons[0] : undefined,
      warning: warnings.length > 0 ? warnings[0] : undefined
    };

  } catch (error) {
    console.error('Error analyzing menu item:', error);
    return { score: 50 };
  }
}