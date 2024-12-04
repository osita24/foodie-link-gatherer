/**
 * Extracts place ID from various Google Maps URL formats
 */
export const extractPlaceId = async (url: string): Promise<string | null> => {
  console.log('Attempting to extract Place ID from URL:', url);

  try {
    // Handle shortened g.co links
    if (url.includes('g.co/kgs/')) {
      console.log('Detected shortened g.co URL');
      return null; // We'll handle these differently
    }

    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    
    // First try to get an existing place_id
    if (searchParams.has('place_id')) {
      const placeId = searchParams.get('place_id');
      console.log('Found direct place_id:', placeId);
      return placeId;
    }

    // Extract coordinates from the URL path
    const coords = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coords) {
      const lat = coords[1];
      const lng = coords[2];
      console.log('Extracted coordinates:', lat, lng);
      
      // Use these coordinates to get the place ID
      const placeId = await findPlaceIdFromCoordinates(lat, lng);
      if (placeId) {
        return placeId;
      }
    }

    // Fallback: try to extract from URL data format
    const matches = url.match(/!1s(ChIJ[^!]+)!/);
    if (matches && matches[1]) {
      console.log('Extracted Place ID from URL data:', matches[1]);
      return matches[1];
    }

    console.log('No Place ID found in URL');
    return null;
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error);
    return null;
  }
};

async function findPlaceIdFromCoordinates(lat: string, lng: string): Promise<string | null> {
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com';
  
  try {
    console.log('Searching for Place ID using coordinates:', lat, lng);
    const response = await fetch(
      `${CORS_PROXY}/https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Geocoding API response:', data);

    if (data.results && data.results[0] && data.results[0].place_id) {
      console.log('Found Place ID from coordinates:', data.results[0].place_id);
      return data.results[0].place_id;
    }

    return null;
  } catch (error) {
    console.error('Error finding Place ID from coordinates:', error);
    return null;
  }
}