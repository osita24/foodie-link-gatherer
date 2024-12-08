import { corsHeaders } from '../_shared/cors.ts';
import { analyzeDietaryCompatibility } from './analyzers/dietaryAnalyzer.ts';
import { analyzeProteinContent } from './analyzers/proteinAnalyzer.ts';
import { analyzeCuisineMatch } from './analyzers/cuisineAnalyzer.ts';
import { analyzeIngredients } from './analyzers/ingredientAnalyzer.ts';

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
    console.log('🔍 Starting analysis for:', item.name);
    console.log('👤 User preferences:', preferences);
    
    const itemContent = `${item.name} ${item.description || ''}`;
    let score = 50; // Base score
    let highlights: string[] = [];
    let considerations: string[] = [];

    // Check dietary restrictions first (deal breaker)
    const dietaryMatch = analyzeDietaryCompatibility(itemContent, preferences.dietary_restrictions);
    if (!dietaryMatch.isCompatible) {
      console.log('❌ Item conflicts with dietary restrictions');
      return {
        score: 20,
        matchType: 'avoid',
        considerations: dietaryMatch.conflicts.map(conflict => 
          `Contains ingredients not suitable for ${conflict} diet`
        ),
        rankDescription: 'Not Recommended'
      };
    }

    // Analyze protein content
    const proteinMatch = analyzeProteinContent(itemContent, preferences.favorite_proteins);
    if (proteinMatch.matches.length > 0) {
      score += proteinMatch.score;
      highlights.push(`Features your preferred protein: ${proteinMatch.matches.join(', ')}`);
    }

    // Analyze cuisine match
    const cuisineMatch = analyzeCuisineMatch(itemContent, preferences.cuisine_preferences);
    if (cuisineMatch.matches.length > 0) {
      score += cuisineMatch.score;
      highlights.push(`Matches ${cuisineMatch.matches.join(', ')} cuisine style`);
    }

    // Check for ingredients to avoid
    const ingredientMatch = analyzeIngredients(itemContent, preferences.favorite_ingredients);
    if (ingredientMatch.conflicts.length > 0) {
      score += ingredientMatch.score;
      considerations.push(...ingredientMatch.conflicts.map(ingredient => 
        `Contains ${ingredient} (listed in foods to avoid)`
      ));
    }

    // Calculate ranking among all items
    const allScores = await Promise.all(allItems.map(async (menuItem) => {
      if (menuItem.id === item.id) return { id: menuItem.id, score };
      
      const otherItemContent = `${menuItem.name} ${menuItem.description || ''}`;
      let itemScore = 50;
      
      const otherDietaryMatch = analyzeDietaryCompatibility(otherItemContent, preferences.dietary_restrictions);
      if (!otherDietaryMatch.isCompatible) itemScore = 20;
      
      const otherProteinMatch = analyzeProteinContent(otherItemContent, preferences.favorite_proteins);
      itemScore += otherProteinMatch.score;
      
      const otherCuisineMatch = analyzeCuisineMatch(otherItemContent, preferences.cuisine_preferences);
      itemScore += otherCuisineMatch.score;
      
      const otherIngredientMatch = analyzeIngredients(otherItemContent, preferences.favorite_ingredients);
      itemScore += otherIngredientMatch.score;
      
      return { id: menuItem.id, score: itemScore };
    }));

    // Sort and find rank
    const sortedScores = allScores.sort((a, b) => b.score - a.score);
    const rank = sortedScores.findIndex(s => s.id === item.id) + 1;
    const totalItems = allItems.length;
    const percentileRank = (totalItems - rank + 1) / totalItems * 100;

    console.log(`📊 Item ranked ${rank} out of ${totalItems} (${percentileRank.toFixed(1)}th percentile)`);

    // Determine match type and description
    let matchType: MatchDetails['matchType'];
    let rankDescription: string;

    if (score >= 90 && rank <= Math.ceil(totalItems * 0.2)) {
      matchType = 'perfect';
      rankDescription = rank <= 3 ? `Top ${rank} Pick! 🌟` : 'Perfect Match';
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

    if (rank <= 3) {
      highlights.unshift(`One of our top picks for you!`);
    }

    const finalScore = Math.min(100, score + Math.max(0, (totalItems - rank) / totalItems * 15));

    console.log('✨ Final analysis:', {
      score: finalScore,
      matchType,
      rank,
      rankDescription,
      highlights,
      considerations
    });

    return {
      score: Math.round(Math.min(100, Math.max(0, finalScore))),
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