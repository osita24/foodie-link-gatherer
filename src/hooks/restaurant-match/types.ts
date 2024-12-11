import { RestaurantDetails } from "@/types/restaurant";
import { UserPreferences as BaseUserPreferences } from "@/types/preferences";

export type UserPreferences = BaseUserPreferences;

export interface RestaurantFeatures extends RestaurantDetails {
  types?: string[];
  servesVegetarianFood?: boolean;
  servesBeer?: boolean;
  servesWine?: boolean;
  delivery?: boolean;
  dineIn?: boolean;
  takeout?: boolean;
  hasOutdoorSeating?: boolean;
  reservable?: boolean;
}

export interface CategoryMatchResult {
  score: number;
  description: string;
}