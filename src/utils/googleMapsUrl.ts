/**
 * Extracts place ID from various Google Maps URL formats
 */
export const extractPlaceId = async (url: string): Promise<string | null> => {
  console.log('Attempting to extract Place ID from URL:', url);

  try {
    // For shortened URLs, we'll need to inform the user to use full URLs instead
    if (url.includes('g.co/kgs/') || url.includes('maps.app.goo.gl')) {
      console.log('Detected shortened URL format');
      throw new Error('SHORTENED_URL');
    }

    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    
    // First try to get place_id from URL parameters
    if (searchParams.has('place_id')) {
      const placeId = searchParams.get('place_id');
      console.log('Found direct place_id:', placeId);
      return placeId;
    }

    // Try to extract from the URL path for newer format URLs
    const pathMatch = url.match(/place\/[^/]+\/([^/]+)/);
    if (pathMatch && pathMatch[1]) {
      const placeId = pathMatch[1];
      if (placeId.startsWith('ChIJ')) {
        console.log('Extracted Place ID from path:', placeId);
        return placeId;
      }
    }

    // Extract from the data parameter for older format URLs
    const dataParam = searchParams.get('data');
    if (dataParam) {
      const placeIdMatch = dataParam.match(/!1s(ChIJ[^!]+)!/);
      if (placeIdMatch && placeIdMatch[1]) {
        console.log('Extracted Place ID from data parameter:', placeIdMatch[1]);
        return placeIdMatch[1];
      }
    }

    // Try to extract from the URL path for business listings
    const businessMatch = url.match(/!1s([^!]+)!8m2/);
    if (businessMatch && businessMatch[1].startsWith('0x')) {
      const placeId = decodeURIComponent(businessMatch[1]);
      console.log('Extracted Place ID from business listing:', placeId);
      return placeId;
    }

    console.log('No Place ID found in URL');
    return null;
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error);
    if (error instanceof Error && error.message === 'SHORTENED_URL') {
      throw new Error('SHORTENED_URL');
    }
    return null;
  }
};