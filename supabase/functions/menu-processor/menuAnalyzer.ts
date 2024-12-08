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
    console.log('🔍 Starting deep analysis for:', item.name);
    console.log('👤 User preferences:', preferences);
    
    const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
    let score = 50; // Base score
    let highlights: string[] = [];
    let considerations: string[] = [];

    // Critical Check: Dietary Restrictions (Deal breaker)
    const dietaryConflict = preferences.dietary_restrictions?.find(
      restriction => itemContent.includes(restriction.toLowerCase())
    );
    if (dietaryConflict) {
      console.log('⚠️ Found dietary conflict:', dietaryConflict);
      return {
        score: 20,
        matchType: 'avoid',
        considerations: [`Contains ${dietaryConflict} (dietary restriction)`],
        highlights: [],
        rankDescription: 'Not Recommended'
      };
    }

    // Protein Match Analysis (Major boost: +25)
    const proteinMatches = preferences.favorite_proteins?.filter(
      protein => itemContent.includes(protein.toLowerCase())
    );
    if (proteinMatches.length > 0) {
      const boost = Math.min(proteinMatches.length * 25, 35);
      score += boost;
      highlights.push(`Features ${proteinMatches.length > 1 ? 'multiple' : 'your'} favorite protein${proteinMatches.length > 1 ? 's' : ''}`);
      console.log('🥩 Protein matches found:', proteinMatches);
    }

    // Cuisine Preference Analysis (Significant boost: +20)
    const cuisineMatches = preferences.cuisine_preferences?.filter(
      cuisine => itemContent.includes(cuisine.toLowerCase())
    );
    if (cuisineMatches.length > 0) {
      const boost = Math.min(cuisineMatches.length * 20, 30);
      score += boost;
      highlights.push(`Matches your preferred cuisine style`);
      console.log('🍽️ Cuisine matches found:', cuisineMatches);
    }

    // Ingredient Analysis
    const favoriteIngredients = preferences.favorite_ingredients?.filter(
      ingredient => itemContent.includes(ingredient.toLowerCase())
    );
    if (favoriteIngredients.length > 0) {
      const warning = favoriteIngredients.map(ingredient => 
        `Contains ${ingredient.toLowerCase()}`
      );
      considerations.push(...warning);
      score -= 15 * favoriteIngredients.length;
      console.log('⚠️ Found ingredients to avoid:', favoriteIngredients);
    }

    // Calculate relative ranking among all items
    const allScores = await Promise.all(allItems.map(async (menuItem) => {
      const content = `${menuItem.name} ${menuItem.description || ''}`.toLowerCase();
      let itemScore = 50;
      
      // Quick scoring for ranking
      const hasProtein = preferences.favorite_proteins?.some(p => content.includes(p.toLowerCase()));
      const hasCuisine = preferences.cuisine_preferences?.some(c => content.includes(c.toLowerCase()));
      const hasRestriction = preferences.dietary_restrictions?.some(r => content.includes(r.toLowerCase()));
      
      if (hasProtein) itemScore += 25;
      if (hasCuisine) itemScore += 20;
      if (hasRestriction) itemScore = 20;
      
      return { id: menuItem.id, score: itemScore };
    }));

    // Sort and find rank
    const sortedScores = allScores.sort((a, b) => b.score - a.score);
    const rank = sortedScores.findIndex(s => s.id === item.id) + 1;
    const totalItems = allItems.length;
    const percentileRank = (totalItems - rank + 1) / totalItems * 100;

    console.log(`📊 Item "${item.name}" ranked ${rank} out of ${totalItems} (${percentileRank.toFixed(1)}th percentile)`);

    // Determine match type and rank description
    let matchType: MatchDetails['matchType'];
    let rankDescription: string;

    if (score >= 90) {
      matchType = 'perfect';
      rankDescription = rank <= 3 ? `#${rank} Top Pick! 🌟` : 'Perfect Match';
    } else if (score >= 75) {
      matchType = 'good';
      rankDescription = rank <= Math.ceil(totalItems * 0.3) 
        ? 'Highly Recommended' 
        : 'Good Match';
    } else if (score >= 40) {
      matchType = 'neutral';
      rankDescription = 'Worth Trying';
    } else {
      matchType = 'warning';
      rankDescription = considerations.length > 0 
        ? 'May Not Match Preferences' 
        : 'Try Something New';
    }

    // Add ranking context for top items
    if (rank <= 3) {
      highlights.unshift(`Ranked #${rank} based on your preferences`);
    }

    // Final score adjustments based on ranking
    const rankingBonus = Math.max(0, (totalItems - rank) / totalItems * 10);
    score = Math.min(100, score + rankingBonus);

    console.log(`✨ Final analysis for ${item.name}:`, {
      score,
      matchType,
      rank,
      rankDescription,
      highlights,
      considerations
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