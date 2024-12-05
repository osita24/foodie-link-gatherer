export async function searchRestaurant(url: string, apiKey: string): Promise<string> {
  console.log("Processing URL:", url);
  
  try {
    // Extract place ID from URL if it contains it
    const placeIdMatch = url.match(/place_id=([^&]+)/);
    if (placeIdMatch) {
      console.log("Found place ID in URL:", placeIdMatch[1]);
      return placeIdMatch[1];
    }

    // If it's a shortened URL, try to expand it
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      console.log("Expanding shortened URL");
      const response = await fetch(url, { redirect: 'follow' });
      const expandedUrl = response.url;
      console.log("Expanded URL:", expandedUrl);
      
      const expandedPlaceIdMatch = expandedUrl.match(/place_id=([^&]+)/);
      if (expandedPlaceIdMatch) {
        console.log("Found place ID in expanded URL:", expandedPlaceIdMatch[1]);
        return expandedPlaceIdMatch[1];
      }
    }

    throw new Error("Could not extract place ID from URL");
  } catch (error) {
    console.error("Error processing URL:", error);
    throw new Error(`Failed to process URL: ${error.message}`);
  }
}