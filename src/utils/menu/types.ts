export interface ScoreFactors {
  dietaryMatch: number;
  proteinMatch: number;
  cuisineMatch: number;
  ingredientMatch: number;
  preparationMatch: number;
}

export interface MenuAnalysisResult {
  score: number;
  factors: ScoreFactors;
}

export interface DietaryRestriction {
  name: string;
  severity: 'strict' | 'preference';
}