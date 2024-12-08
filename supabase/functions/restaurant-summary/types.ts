export interface RestaurantFeatures {
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
  rating?: number;
  priceLevel?: number;
  types?: string[];
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

export interface Reason {
  emoji: string;
  text: string;
}

export interface SummaryResponse {
  verdict: "MUST VISIT" | "WORTH A TRY" | "SKIP IT";
  reasons: Reason[];
}