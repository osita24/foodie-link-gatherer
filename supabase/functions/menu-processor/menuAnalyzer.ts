import { analyzeDietaryCompatibility } from './analyzers/dietaryAnalyzer.ts';
import { analyzeProteinContent } from './analyzers/proteinAnalyzer.ts';
import { analyzeCuisineMatch } from './analyzers/cuisineAnalyzer.ts';
import { analyzeIngredients } from './analyzers/ingredientAnalyzer.ts';

export async function analyzeMenuItem(item: any, preferences: any) {
  console.log('🔍 Starting menu item analysis for:', item.name);
  console.log('👤 User preferences:', preferences);

  const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();

  // Analyze different aspects
  const dietaryMatch = analyzeDietaryCompatibility(itemContent, preferences.dietary_restrictions || []);
  const proteinMatch = analyzeProteinContent(itemContent, preferences.favorite_proteins || []);
  const cuisineMatch = analyzeCuisineMatch(itemContent, preferences.cuisine_preferences || []);
  const ingredientMatch = analyzeIngredients(itemContent, preferences.favorite_ingredients || []);

  console.log('📊 Analysis results:', {
    dietaryMatch,
    proteinMatch,
    cuisineMatch,
    ingredientMatch
  });

  // Calculate total score
  let totalScore = 75; // Base score
  const highlights: string[] = [];
  const considerations: string[] = [];

  // Adjust score based on matches
  if (dietaryMatch.conflicts.length > 0) {
    totalScore -= 50;
    considerations.push(...dietaryMatch.conflicts.map(c => `Contains ${c.toLowerCase()}`));
  }

  if (proteinMatch.matches.length > 0) {
    totalScore += proteinMatch.score;
    highlights.push(...proteinMatch.matches.map(p => `Contains ${p.toLowerCase()}`));
  }

  if (cuisineMatch.matches.length > 0) {
    totalScore += cuisineMatch.score;
    highlights.push(...cuisineMatch.matches.map(c => `${c} style dish`));
  }

  totalScore += ingredientMatch.score;
  if (ingredientMatch.conflicts.length > 0) {
    considerations.push(...ingredientMatch.conflicts.map(i => `Contains ${i.toLowerCase()}`));
  }

  // Ensure score stays within bounds
  totalScore = Math.max(0, Math.min(100, totalScore));

  // Determine match type
  let matchType: string;
  let reason: string;

  if (totalScore >= 90) {
    matchType = 'perfect';
    reason = 'Perfect match!';
  } else if (totalScore >= 75) {
    matchType = 'good';
    reason = 'Good match';
  } else if (totalScore >= 50) {
    matchType = 'neutral';
    reason = 'Might be worth trying';
  } else if (totalScore >= 25) {
    matchType = 'warning';
    reason = 'May not match preferences';
  } else {
    matchType = 'avoid';
    reason = 'Not recommended';
  }

  const result = {
    score: totalScore,
    matchType,
    reason,
    highlights: highlights.slice(0, 3), // Limit to top 3 highlights
    considerations: considerations.slice(0, 2), // Limit to top 2 considerations
  };

  console.log('✅ Final analysis result:', result);
  return result;
}