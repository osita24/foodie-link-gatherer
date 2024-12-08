import { corsHeaders } from '../_shared/cors.ts';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
}

interface UserPreferences {
  cuisine_preferences: string[];
  dietary_restrictions: string[];
  favorite_ingredients: string[];
  favorite_proteins: string[];
  atmosphere_preferences: string[];
}

interface MatchDetails {
  score: number;
  matchType: 'perfect' | 'good' | 'neutral' | 'warning' | 'avoid';
  highlights?: string[];
  considerations?: string[];
  rank?: number;
  rankDescription?: string;
}

export async function analyzeMenuItem(
  item: MenuItem,
  preferences: UserPreferences,
  allItems: MenuItem[]
): Promise<MatchDetails> {
  try {
    console.log('🔍 Analyzing menu item:', item.name);
    console.log('👤 User preferences:', preferences);
    
    const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
    let score = 50; // Base score
    let highlights: string[] = [];
    let considerations: string[] = [];

    // Check for dietary restrictions (Critical)
    const dietaryConflict = preferences.dietary_restrictions?.find(
      (restriction: string) => itemContent.includes(restriction.toLowerCase())
    );
    if (dietaryConflict) {
      return {
        score: 20,
        matchType: 'avoid',
        considerations: [`Contains ${dietaryConflict}`],
        highlights: [],
      };
    }

    // Check for favorite proteins (Major boost: +30)
    const proteinMatch = preferences.favorite_proteins?.find(
      (protein: string) => itemContent.includes(protein.toLowerCase())
    );
    if (proteinMatch) {
      score += 30;
      highlights.push(`Features your favorite: ${proteinMatch}`);
    }

    // Check cuisine preferences (Significant boost: +20)
    const cuisineMatch = preferences.cuisine_preferences?.find(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    );
    if (cuisineMatch) {
      score += 20;
      highlights.push(`Matches ${cuisineMatch} cuisine`);
    }

    // Check for foods to avoid (Major reduction: -25)
    const avoidedIngredient = preferences.favorite_ingredients?.find(
      (food: string) => itemContent.includes(food.toLowerCase())
    );
    if (avoidedIngredient) {
      score -= 25;
      considerations.push(`Contains ${avoidedIngredient} which you prefer to avoid`);
    }

    // Calculate relative ranking
    const allScores = await Promise.all(allItems.map(async (menuItem) => {
      const content = `${menuItem.name} ${menuItem.description || ''}`.toLowerCase();
      let itemScore = 50;
      
      if (preferences.favorite_proteins?.some(p => content.includes(p.toLowerCase()))) {
        itemScore += 30;
      }
      if (preferences.cuisine_preferences?.some(c => content.includes(c.toLowerCase()))) {
        itemScore += 20;
      }
      if (preferences.favorite_ingredients?.some(i => content.includes(i.toLowerCase()))) {
        itemScore -= 25;
      }
      return { id: menuItem.id, score: itemScore };
    }));

    // Sort scores and find rank
    const sortedScores = allScores.sort((a, b) => b.score - a.score);
    const rank = sortedScores.findIndex(s => s.id === item.id) + 1;
    const totalItems = allItems.length;

    // Determine match type and rank description
    let matchType: MatchDetails['matchType'] = 'neutral';
    let rankDescription = '';

    if (score >= 90) {
      matchType = 'perfect';
      rankDescription = rank <= 3 ? 'Top Pick! 🌟' : 'Perfect Match';
    } else if (score >= 75) {
      matchType = 'good';
      rankDescription = rank <= Math.ceil(totalItems * 0.3) ? 'Highly Recommended' : 'Good Match';
    } else if (score >= 40) {
      matchType = 'neutral';
      rankDescription = 'Worth Trying';
    } else {
      matchType = 'warning';
      rankDescription = 'May Not Match Preferences';
    }

    // Add ranking context to highlights
    if (rank <= 3) {
      highlights.unshift(`#${rank} recommended dish`);
    }

    console.log(`✨ Analysis complete for ${item.name}:`, {
      score,
      matchType,
      rank,
      rankDescription
    });

    return {
      score: Math.min(100, Math.max(0, score)),
      matchType,
      highlights: highlights.length > 0 ? highlights : undefined,
      considerations: considerations.length > 0 ? considerations : undefined,
      rank,
      rankDescription
    };
  } catch (error) {
    console.error('❌ Error analyzing menu item:', error);
    return { 
      score: 50,
      matchType: 'neutral',
      rank: 0,
      rankDescription: 'Basic recommendation'
    };
  }
}