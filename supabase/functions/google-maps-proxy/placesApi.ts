import { PlaceDetailsResponse } from "./types.ts";

export async function getPlaceDetails(placeId: string, apiKey: string): Promise<PlaceDetailsResponse> {
  console.log("Fetching place details for:", placeId);
  
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.append("place_id", placeId);
    url.searchParams.append("key", apiKey);
    url.searchParams.append("reviews_sort", "newest");
    url.searchParams.append("reviews_no_translations", "true");
    url.searchParams.append("fields", [
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
    ].join(","));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received reviews count:", data.result.reviews?.length);
    return data;
  } catch (error) {
    console.error("Error fetching place details:", error);
    throw error;
  }
}