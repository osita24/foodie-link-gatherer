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
    const dietaryConflicts = preferences.dietary_restrictions?.filter(
      restriction => itemContent.includes(restriction.toLowerCase())
    );
    
    if (dietaryConflicts?.length > 0) {
      console.log('⚠️ Found dietary conflicts:', dietaryConflicts);
      return {
        score: 20,
        matchType: 'avoid',
        considerations: dietaryConflicts.map(conflict => `Contains ${conflict} (dietary restriction)`),
        highlights: [],
        rankDescription: 'Not Recommended'
      };
    }

    // Protein Match Analysis (Major boost: +30)
    const proteinMatches = preferences.favorite_proteins?.filter(
      protein => itemContent.includes(protein.toLowerCase())
    );
    if (proteinMatches?.length > 0) {
      const boost = Math.min(proteinMatches.length * 30, 40);
      score += boost;
      highlights.push(`Features ${proteinMatches.join(', ')}`);
      console.log('🥩 Protein matches found:', proteinMatches);
    }

    // Cuisine Preference Analysis (Significant boost: +25)
    const cuisineMatches = preferences.cuisine_preferences?.filter(
      cuisine => itemContent.includes(cuisine.toLowerCase())
    );
    if (cuisineMatches?.length > 0) {
      const boost = Math.min(cuisineMatches.length * 25, 35);
      score += boost;
      highlights.push(`Matches ${cuisineMatches.join(', ')} cuisine`);
      console.log('🍽️ Cuisine matches found:', cuisineMatches);
    }

    // Ingredient Avoidance Analysis (Major penalty: -25 per item)
    const avoidedIngredients = preferences.favorite_ingredients?.filter(
      ingredient => itemContent.includes(ingredient.toLowerCase())
    );
    if (avoidedIngredients?.length > 0) {
      const penalty = Math.min(avoidedIngredients.length * 25, 50);
      score -= penalty;
      considerations.push(...avoidedIngredients.map(ingredient => 
        `Contains ${ingredient} (listed in foods to avoid)`
      ));
      console.log('⚠️ Found ingredients to avoid:', avoidedIngredients);
    }

    // Calculate relative ranking among all items
    const allScores = await Promise.all(allItems.map(async (menuItem) => {
      const content = `${menuItem.name} ${menuItem.description || ''}`.toLowerCase();
      let itemScore = 50;
      
      // Quick scoring for ranking
      const hasProtein = preferences.favorite_proteins?.some(p => content.includes(p.toLowerCase()));
      const hasCuisine = preferences.cuisine_preferences?.some(c => content.includes(c.toLowerCase()));
      const hasRestriction = preferences.dietary_restrictions?.some(r => content.includes(r.toLowerCase()));
      const hasAvoided = preferences.favorite_ingredients?.some(i => content.includes(i.toLowerCase()));
      
      if (hasProtein) itemScore += 30;
      if (hasCuisine) itemScore += 25;
      if (hasRestriction) itemScore = 20;
      if (hasAvoided) itemScore -= 25;
      
      return { id: menuItem.id, score: itemScore };
    }));

    // Sort and find rank
    const sortedScores = allScores.sort((a, b) => b.score - a.score);
    const rank = sortedScores.findIndex(s => s.id === item.id) + 1;
    const totalItems = allItems.length;
    const percentileRank = (totalItems - rank + 1) / totalItems * 100;

    console.log(`📊 Item "${item.name}" ranked ${rank} out of ${totalItems} (${percentileRank.toFixed(1)}th percentile)`);

    // Determine match type and rank description based on final score and ranking
    let matchType: MatchDetails['matchType'];
    let rankDescription: string;

    if (score >= 90 && rank <= Math.ceil(totalItems * 0.2)) {
      matchType = 'perfect';
      rankDescription = rank <= 3 ? `#${rank} Top Pick! 🌟` : 'Perfect Match';
    } else if (score >= 75 && rank <= Math.ceil(totalItems * 0.4)) {
      matchType = 'good';
      rankDescription = 'Highly Recommended';
    } else if (score >= 50 && rank <= Math.ceil(totalItems * 0.7)) {
      matchType = 'neutral';
      rankDescription = 'Worth Trying';
    } else if (score < 50 || rank > Math.ceil(totalItems * 0.7)) {
      matchType = 'warning';
      rankDescription = considerations.length > 0 
        ? 'May Not Match Preferences' 
        : 'Different from Your Usual';
    } else {
      matchType = 'neutral';
      rankDescription = 'Standard Option';
    }

    // Add ranking context for top items
    if (rank <= 3) {
      highlights.unshift(`Ranked #${rank} based on your preferences`);
    }

    // Final score adjustments based on ranking
    const rankingBonus = Math.max(0, (totalItems - rank) / totalItems * 15);
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
      score: Math.round(Math.min(100, Math.max(0, score))),
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