export interface RestaurantFeatures {
  name: string;
  rating?: number;
  priceLevel?: number;
  types?: string[];
  servesBreakfast?: boolean;
  servesBrunch?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  servesVegetarianFood?: boolean;
  servesBeer?: boolean;
  servesWine?: boolean;
  delivery?: boolean;
  dineIn?: boolean;
  takeout?: boolean;
  reservable?: boolean;
}

export interface UserPreferences {
  cuisine_preferences?: string[];
  dietary_restrictions?: string[];
  favorite_ingredients?: string[];
  atmosphere_preferences?: string[];
  favorite_proteins?: string[];
  price_range?: string;
  spice_level?: number;
}

export interface MatchScores {
  dietaryScore: number;
  cuisineScore: number;
  priceScore: number;
  atmosphereScore: number;
  proteinScore: number;
}

export interface Reason {
  emoji: string;
  text: string;
  priority: number;
}

export type Verdict = "PERFECT MATCH" | "WORTH EXPLORING" | "CONSIDER WITH CARE";

export interface SummaryResponse {
  verdict: Verdict;
  reasons: Array<{ emoji: string; text: string }>;
}