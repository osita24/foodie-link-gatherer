export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface Review {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface RestaurantDetails {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  address: string;
  hours: string;
  phone: string;
  website: string;
  photos: string[];
  priceLevel: number;
  menu?: MenuCategory[];
  openingHours?: {
    periods: {
      open: { day: number; time: string };
      close: { day: number; time: string };
    }[];
    weekdayText: string[];
  };
  vicinity?: string;
  types?: string[];
  userRatingsTotal?: number;
  utcOffset?: number;
  googleReviews?: Review[];
  // Business status
  businessStatus?: string;
  // Delivery and dining options
  curbsidePickup?: boolean;
  delivery?: boolean;
  dineIn?: boolean;
  priceRange?: string;
  reservable?: boolean;
  takeout?: boolean;
  // Meal service
  servesBreakfast?: boolean;
  servesBrunch?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  // Drinks
  servesBeer?: boolean;
  servesWine?: boolean;
  servesCocktails?: boolean;
  servesCoffee?: boolean;
  // Food options
  servesDessert?: boolean;
  servesVegetarianFood?: boolean;
  // Amenities
  wheelchairAccessible?: boolean;
  outdoorSeating?: boolean;
  hasHappyHour?: boolean;
  hasLiveMusic?: boolean;
  hasParking?: boolean;
  hasWifi?: boolean;
  smokingAllowed?: boolean;
  noiseLevel?: string;
}