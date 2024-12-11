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
  warning?: string; // Added warning as an optional property
}

export interface DietaryRestriction {
  name: string;
  severity: 'strict' | 'preference';
}