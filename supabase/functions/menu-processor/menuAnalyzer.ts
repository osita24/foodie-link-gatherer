import { UserPreferences } from "../../../src/types/preferences";

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: UserPreferences,
): Promise<{
  score: number;
  matchType: 'perfect-match' | 'try-something-new' | 'not-recommended';
  reason?: string;
  warning?: string;
}> {
  console.log('🔍 Analyzing menu item:', item.name);
  
  const itemContent = `${item.name.toLowerCase()} ${item.description?.toLowerCase() || ''}`;

  // Check for dietary restrictions and allergens first
  const hasRestriction = preferences.dietaryRestrictions?.some(
    restriction => itemContent.includes(restriction.toLowerCase())
  );
  
  const hasAllergen = preferences.foodsToAvoid?.some(
    allergen => itemContent.includes(allergen.toLowerCase())
  );

  if (hasRestriction || hasAllergen) {
    return {
      score: 20,
      matchType: 'not-recommended',
      warning: hasAllergen 
        ? "Contains ingredients you avoid" 
        : "Doesn't match your dietary preferences"
    };
  }

  // Check for favorite proteins
  const hasPreferredProtein = preferences.favoriteProteins?.some(
    protein => itemContent.includes(protein.toLowerCase())
  );

  if (hasPreferredProtein) {
    return {
      score: 95,
      matchType: 'perfect-match',
      reason: "Contains your favorite protein!"
    };
  }

  // Check for cuisine preferences
  const hasFavoriteCuisine = preferences.cuisinePreferences?.some(
    cuisine => itemContent.includes(cuisine.toLowerCase())
  );

  if (hasFavoriteCuisine) {
    return {
      score: 90,
      matchType: 'perfect-match',
      reason: "Matches your favorite cuisine!"
    };
  }

  // If no strong matches but also no restrictions, suggest as something new
  return {
    score: 75,
    matchType: 'try-something-new',
    reason: "Something new that matches your preferences"
  };
}