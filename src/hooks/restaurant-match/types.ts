import { RestaurantDetails } from "@/types/restaurant";
import { UserPreferences } from "@/types/preferences";

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