export interface LocationData {
  lat?: number;
  lng?: number;
  address?: string;
}

export interface RestaurantSearchResult {
  name: string;
  location: LocationData;
}

export interface PlacesSearchResponse {
  status: string;
  results: any[];
  error_message?: string;
}