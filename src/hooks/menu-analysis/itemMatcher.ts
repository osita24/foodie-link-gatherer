interface ItemMatch {
  score: number;
  matchType: 'perfect' | 'good' | 'neutral' | 'warning';
  reason?: string;
  warning?: string;
}

export const calculateItemMatch = async (
  item: any,
  preferences: any
): Promise<ItemMatch> => {
  console.log(`🔍 Analyzing item: ${item.name}`);
  console.log('👤 Using preferences:', preferences);

  const itemContent = `${item.name} ${item.description || ''} ${item.category || ''}`.toLowerCase();
  let score = 50;
  let reasons: string[] = [];
  let warnings: string[] = [];

  // Check dietary restrictions (highest priority)
  if (preferences.dietary_restrictions?.length) {
    const restrictions = preferences.dietary_restrictions.map((r: string) => r.toLowerCase());
    
    // Check if item conflicts with any restrictions
    const conflicts = restrictions.filter(restriction => {
      switch (restriction) {
        case 'vegetarian':
          return /\b(chicken|beef|pork|fish|seafood|meat)\b/.test(itemContent);
        case 'vegan':
          return /\b(meat|cheese|cream|milk|egg|butter|honey)\b/.test(itemContent);
        case 'gluten-free':
          return /\b(wheat|bread|pasta|flour)\b/.test(itemContent);
        default:
          return false;
      }
    });

    if (conflicts.length > 0) {
      return {
        score: 20,
        matchType: 'warning',
        warning: `Contains ingredients not suitable for ${conflicts.join(', ')} diet`
      };
    }

    // If no conflicts, boost score
    score += 30;
    reasons.push("Matches dietary preferences");
  }

  // Check cuisine preferences
  if (preferences.cuisine_preferences?.length) {
    const cuisines = preferences.cuisine_preferences.map((c: string) => c.toLowerCase());
    const matchingCuisines = cuisines.filter((cuisine: string) => 
      itemContent.includes(cuisine)
    );

    if (matchingCuisines.length > 0) {
      score += 25;
      reasons.push(`Matches preferred ${matchingCuisines[0]} cuisine`);
    }
  }

  // Check favorite proteins
  if (preferences.favorite_proteins?.length) {
    const proteins = preferences.favorite_proteins.map((p: string) => p.toLowerCase());
    const matchingProteins = proteins.filter((protein: string) => 
      itemContent.includes(protein)
    );

    if (matchingProteins.length > 0) {
      score += 20;
      reasons.push(`Contains ${matchingProteins[0]}, your preferred protein`);
    }
  }

  // Check ingredients to avoid
  if (preferences.favorite_ingredients?.length) {
    const ingredients = preferences.favorite_ingredients.map((i: string) => i.toLowerCase());
    const matchingIngredients = ingredients.filter((ingredient: string) => 
      itemContent.includes(ingredient)
    );

    if (matchingIngredients.length > 0) {
      return {
        score: 30,
        matchType: 'warning',
        warning: `Contains ${matchingIngredients[0]} which you prefer to avoid`
      };
    }
  }

  // Determine match type based on final score
  let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
  
  if (score >= 90) {
    matchType = 'perfect';
  } else if (score >= 75) {
    matchType = 'good';
  } else if (score < 40) {
    matchType = 'warning';
  }

  console.log(`✨ Match result for ${item.name}:`, {
    score,
    matchType,
    reasons,
    warnings
  });

  return {
    score,
    matchType,
    reason: reasons[0],
    warning: warnings[0]
  };
};