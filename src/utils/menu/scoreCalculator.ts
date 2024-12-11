import { MenuAnalysisResult, ScoreFactors } from './types';
import { analyzeDishSemantics } from './semanticAnalyzer';
import { analyzeDietaryCompliance } from './dietaryAnalyzer';

export const calculateMenuItemScore = async (
  itemContent: string,
  preferences: any
): Promise<MenuAnalysisResult> => {
  console.log("🔍 Starting enhanced menu item analysis for:", itemContent);
  console.log("👤 User preferences:", preferences);

  const semanticResults = await analyzeDishSemantics(itemContent);
  
  // Convert user preferences to dietary restrictions format with enhanced severity
  const dietaryRestrictions = [
    ...(preferences.dietary_restrictions || []).map((r: string) => ({
      name: r,
      severity: 'strict'
    })),
    ...(preferences.foodsToAvoid || []).map((r: string) => ({
      name: r,
      severity: 'preference'
    }))
  ];

  const dietaryAnalysis = await analyzeDietaryCompliance(
    itemContent,
    dietaryRestrictions,
    semanticResults
  );

  if (!dietaryAnalysis.compliant) {
    console.log("❌ Item failed dietary compliance check");
    return {
      score: 0,
      factors: {
        dietaryMatch: 0,
        proteinMatch: 0,
        cuisineMatch: 0,
        ingredientMatch: 0,
        preparationMatch: 0
      }
    };
  }

  // Enhanced high sodium detection with more keywords
  const highSodiumKeywords = [
    'salty', 'brined', 'cured', 'pickled', 'soy sauce', 'fish sauce', 
    'teriyaki', 'miso', 'preserved', 'fermented', 'salt-cured',
    'nam pla', 'ponzu', 'oyster sauce', 'MSG', 'bouillon'
  ];
  
  const hasHighSodiumIndicators = highSodiumKeywords.some(keyword => 
    itemContent.toLowerCase().includes(keyword)
  );

  // Enhanced sodium penalty based on preference strength
  const sodiumPenalty = preferences.foodsToAvoid?.includes('High Sodium') && hasHighSodiumIndicators ? -40 : 0;
  
  // Enhanced preparation method scoring
  const healthyPreparationMethods = {
    'grilled': 20,
    'steamed': 20,
    'baked': 15,
    'roasted': 15,
    'poached': 15,
    'raw': 10,
    'sautéed': 5
  };

  const unhealthyPreparationMethods = {
    'fried': -20,
    'deep-fried': -25,
    'battered': -15,
    'breaded': -10
  };

  let prepScore = 10; // Default score
  
  // Check for healthy preparation methods
  Object.entries(healthyPreparationMethods).forEach(([method, score]) => {
    if (semanticResults.prepMethod.includes(method)) {
      prepScore += score;
    }
  });

  // Check for unhealthy preparation methods
  Object.entries(unhealthyPreparationMethods).forEach(([method, penalty]) => {
    if (semanticResults.prepMethod.includes(method)) {
      prepScore += penalty;
    }
  });
  
  // Calculate final score components with enhanced weights
  const factors: ScoreFactors = {
    dietaryMatch: dietaryAnalysis.score * 0.35, // Increased weight for dietary compliance
    proteinMatch: preferences.favorite_proteins?.some(
      (p: string) => semanticResults.mainIngredients.includes(p)
    ) ? 30 : 0, // Increased protein match score
    cuisineMatch: preferences.cuisine_preferences?.includes(
      semanticResults.cuisineType
    ) ? 25 : 0,
    ingredientMatch: preferences.favorite_ingredients?.some(
      (i: string) => semanticResults.mainIngredients.includes(i)
    ) ? 20 : 0,
    preparationMatch: prepScore
  };

  const totalScore = Math.min(100, Math.max(0,
    Object.values(factors).reduce((sum, score) => sum + score, 0) + sodiumPenalty
  ));

  console.log("📊 Enhanced score calculation:", {
    factors,
    sodiumPenalty,
    totalScore,
    semanticResults
  });

  return { score: totalScore, factors };
};