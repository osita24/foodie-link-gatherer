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
    
    // Basic analysis without AI for common cases
    const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();

    // Check dietary restrictions first (critical)
    if (preferences.dietary_restrictions?.some(
      (restriction: string) => itemContent.includes(restriction.toLowerCase())
    )) {
      return {
        score: 20,
        warning: "Contains ingredients you avoid"
      };
    }

    // Check favorite proteins (strong positive)
    if (preferences.favorite_proteins?.some(
      (protein: string) => itemContent.includes(protein.toLowerCase())
    )) {
      return {
        score: 95,
        reason: "Contains your favorite protein!"
      };
    }

    // Check cuisine preferences (positive)
    if (preferences.cuisine_preferences?.some(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    )) {
      return {
        score: 90,
        reason: "Matches your favorite cuisine!"
      };
    }

    // Check favorite ingredients (positive)
    if (preferences.favorite_ingredients?.some(
      (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
    )) {
      return {
        score: 85,
        reason: "Contains ingredients you love!"
      };
    }

    // Default moderate score if no strong matches/mismatches
    return { score: 75 };

  } catch (error) {
    console.error('Error analyzing menu item:', error);
    return { score: 50 };
  }
}