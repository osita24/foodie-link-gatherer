export type PriceRange = 'budget' | 'moderate' | 'upscale' | 'luxury';

export interface UserPreferences {
  cuisinePreferences: string[];
  dietaryRestrictions: string[];
  foodsToAvoid: string[];
  atmospherePreferences: string[];
  favoriteIngredients: string[];
  favoriteProteins: string[];
  spiceLevel: number;
  priceRange: PriceRange;
  specialConsiderations: string;
}