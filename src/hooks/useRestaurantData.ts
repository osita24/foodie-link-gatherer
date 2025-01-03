import { useQuery } from "@tanstack/react-query";
import { fetchRestaurantDetails } from "@/services/googlePlaces";
import { RestaurantDetails } from "@/types/restaurant";

export const useRestaurantData = (placeId: string, initialData?: RestaurantDetails) => {
  return useQuery<RestaurantDetails>({
    queryKey: ['restaurant', placeId],
    queryFn: () => fetchRestaurantDetails(placeId),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    initialData: initialData, // Use the data passed from navigation if available
  });
};