interface MenuItem {
  name: string;
  description?: string;
}

interface UserPreferences {
  favorite_proteins?: string[];
  dietary_restrictions?: string[];
  cuisine_preferences?: string[];
  favorite_ingredients?: string[];
  spice_level?: number;
}

export async function menuAnalyzer(item: MenuItem, preferences: UserPreferences) {
  console.log('Analyzing item:', item);
  console.log('User preferences:', preferences);

  const itemText = `${item.name} ${item.description || ''}`.toLowerCase();
  let score = 50;
  let reasons: string[] = [];
  let warnings: string[] = [];

  // Only analyze if we have preferences
  if (!preferences) {
    console.log('No preferences available, returning default score');
    return { score: 75 };
  }

  // Check favorite proteins (highest impact)
  if (preferences.favorite_proteins?.length) {
    for (const protein of preferences.favorite_proteins) {
      if (itemText.includes(protein.toLowerCase())) {
        score += 30;
        reasons.push(`Contains ${protein} (your favorite protein)`);
        break; // Only count once for proteins
      }
    }
  }

  // Check dietary restrictions (critical)
  if (preferences.dietary_restrictions?.length) {
    for (const restriction of preferences.dietary_restrictions) {
      if (itemText.includes(restriction.toLowerCase())) {
        score -= 50; // Significant penalty
        warnings.push(`Contains ${restriction} (dietary restriction)`);
      }
    }
  }

  // Check favorite ingredients (moderate impact)
  if (preferences.favorite_ingredients?.length) {
    for (const ingredient of preferences.favorite_ingredients) {
      if (itemText.includes(ingredient.toLowerCase())) {
        score += 15;
        reasons.push(`Contains ${ingredient} (ingredient you love)`);
      }
    }
  }

  // Check cuisine preferences (moderate impact)
  if (preferences.cuisine_preferences?.length) {
    for (const cuisine of preferences.cuisine_preferences) {
      if (itemText.includes(cuisine.toLowerCase())) {
        score += 20;
        reasons.push(`Matches ${cuisine} cuisine`);
      }
    }
  }

  // Normalize score between 0 and 100
  score = Math.min(Math.max(score, 0), 100);

  // Only return reasons for very good matches or warnings
  const result: any = { score };
  
  if (score >= 85) {
    result.reason = reasons[0]; // Primary reason for excellent matches
    result.allReasons = reasons;
  }
  
  if (warnings.length > 0) {
    result.warning = warnings[0]; // Primary warning
    result.allWarnings = warnings;
  }

  console.log('Analysis result:', result);
  return result;
}