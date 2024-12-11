import { MenuAnalysisResult, ScoreFactors } from './types';
import { analyzeDishSemantics } from './semanticAnalyzer';
import { analyzeDietaryCompliance } from './dietaryAnalyzer';

export const calculateMenuItemScore = async (
  itemContent: string,
  preferences: any
): Promise<MenuAnalysisResult> => {
  console.log("🔍 Starting menu item analysis for:", itemContent);
  console.log("👤 User preferences:", preferences);

  const semanticResults = await analyzeDishSemantics(itemContent);
  
  // Convert user preferences to dietary restrictions format
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

  // Calculate preparation method score
  const prepScore = semanticResults.prepMethod.includes('fried') ? 0 : 20;
  
  // Calculate final score components
  const factors: ScoreFactors = {
    dietaryMatch: dietaryAnalysis.score * 0.3,
    proteinMatch: preferences.favorite_proteins?.some(
      (p: string) => semanticResults.mainIngredients.includes(p)
    ) ? 25 : 0,
    cuisineMatch: preferences.cuisine_preferences?.includes(
      semanticResults.cuisineType
    ) ? 25 : 0,
    ingredientMatch: 0, // Will be enhanced with ingredient semantic analysis
    preparationMatch: prepScore
  };

  const totalScore = Math.min(100, Math.max(0,
    Object.values(factors).reduce((sum, score) => sum + score, 0)
  ));

  console.log("📊 Final score calculation:", {
    factors,
    totalScore,
    semanticResults
  });

  return { score: totalScore, factors };
};