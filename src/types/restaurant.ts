export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
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
}