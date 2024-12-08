interface SupabasePreferences {
  atmosphere_preferences: string[];
  cuisine_preferences: string[];
  dietary_restrictions: string[];
  favorite_ingredients: string[];
  favorite_proteins: string[];
  spice_level: number;
  price_range: 'budget' | 'moderate' | 'upscale' | 'luxury';
  special_considerations: string;
  id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string | null;
  preferred_dining_times: string[];
}

import { UserPreferences } from "@/types/preferences";

export const mapSupabaseToUserPreferences = (data: SupabasePreferences): UserPreferences => {
  return {
    atmospherePreferences: data.atmosphere_preferences || [],
    cuisinePreferences: data.cuisine_preferences || [],
    dietaryRestrictions: data.dietary_restrictions || [],
    foodsToAvoid: data.favorite_ingredients || [], // Using this field for foods to avoid
    favoriteIngredients: [],
    favoriteProteins: data.favorite_proteins || [],
    spiceLevel: data.spice_level || 3,
    priceRange: data.price_range || 'moderate',
    specialConsiderations: data.special_considerations || "",
  };
};