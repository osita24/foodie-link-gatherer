export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
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
}