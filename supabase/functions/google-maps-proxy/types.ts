export interface PlaceDetailsResponse {
  result: {
    name: string;
    place_id: string;
    rating?: number;
    formatted_phone_number?: string;
    formatted_address?: string;
    opening_hours?: {
      periods: Array<{
        open: { day: number; time: string };
        close: { day: number; time: string };
      }>;
      weekday_text: string[];
    };
    website?: string;
    price_level?: number;
    user_ratings_total?: number;
    reviews?: Array<{
      author_name: string;
      profile_photo_url: string;
      rating: number;
      relative_time_description: string;
      text: string;
      time: number;
    }>;
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
      html_attributions: string[];
    }>;
    utc_offset?: number;
    vicinity?: string;
    types?: string[];
    business_status?: string;
    dine_in?: boolean;
    delivery?: boolean;
    serves_breakfast?: boolean;
    serves_lunch?: boolean;
    serves_dinner?: boolean;
    serves_brunch?: boolean;
    serves_vegetarian_food?: boolean;
    serves_beer?: boolean;
    serves_wine?: boolean;
    takeout?: boolean;
    curbside_pickup?: boolean;
    reservable?: boolean;
    wheelchair_accessible_entrance?: boolean;
  };
  status: string;
}