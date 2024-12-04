export type PriceRange = 'budget' | 'moderate' | 'upscale' | 'luxury';

export interface UserPreferences {
  cuisinePreferences: string[];
  dietaryRestrictions: string[];
  favoriteIngredients: string[];
  spiceLevel: number;
  priceRange: PriceRange;
  atmospherePreferences: string[];
  specialConsiderations: string;
}