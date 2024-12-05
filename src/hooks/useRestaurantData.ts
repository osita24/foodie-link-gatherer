import { useQuery } from "@tanstack/react-query";
import { fetchRestaurantDetails } from "@/services/googlePlaces";
import { RestaurantDetails } from "@/types/restaurant";

export const useRestaurantData = (placeId: string) => {
  return useQuery({
    queryKey: ['restaurant', placeId],
    queryFn: () => fetchRestaurantDetails(placeId),
    enabled: !!placeId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};