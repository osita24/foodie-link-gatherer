export interface LocationData {
  lat?: number;
  lng?: number;
  address?: string;
}

export interface RestaurantSearchResult {
  name: string;
  location: LocationData;
  placeId?: string;
}

export interface PlacesSearchResponse {
  status: string;
  results: any[];
  error_message?: string;
}

export interface ExpandedUrlResult {
  originalUrl: string;
  expandedUrl: string;
  error?: string;
}