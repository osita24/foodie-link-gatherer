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
  matchType?: 'perfect' | 'good' | 'neutral' | 'warning';
  reason?: string;
}

export interface DietaryRestriction {
  name: string;
  severity: 'strict' | 'preference';
}