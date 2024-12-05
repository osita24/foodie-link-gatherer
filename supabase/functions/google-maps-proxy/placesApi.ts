import { createClient } from "@googlemaps/google-maps-services-js";
import { PlaceDetailsResponse } from "./types";

const client = createClient({});

export async function getPlaceDetails(placeId: string, apiKey: string): Promise<PlaceDetailsResponse> {
  console.log("Fetching place details for:", placeId);
  
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: apiKey,
        reviews_sort: "newest", // Sort reviews by newest first
        reviews_no_translations: true, // Get original reviews without translations
        // These fields ensure we get all available data including reviews
        fields: [
          "name",
          "rating",
          "formatted_phone_number",
          "formatted_address",
          "opening_hours",
          "website",
          "price_level",
          "user_ratings_total",
          "reviews",
          "photos",
          "utc_offset",
          "vicinity",
          "types",
          "business_status",
          "dine_in",
          "delivery",
          "serves_breakfast",
          "serves_lunch",
          "serves_dinner",
          "serves_brunch",
          "serves_vegetarian_food",
          "serves_beer",
          "serves_wine",
          "takeout",
          "curbside_pickup",
          "reservable",
          "wheelchair_accessible_entrance"
        ]
      },
    });

    console.log("Received reviews count:", response.data.result.reviews?.length);
    return response.data;
  } catch (error) {
    console.error("Error fetching place details:", error);
    throw error;
  }
}