import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves a shortened URL to its full form
 */
async function resolveShortUrl(url: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('resolve-maps-url', {
    body: { url }
  });

  if (error) {
    console.error('Error resolving shortened URL:', error);
    throw new Error('Failed to resolve shortened URL');
  }

  return data.resolvedUrl;
}

/**
 * Extracts place ID from various Google Maps URL formats
 */
export const extractPlaceId = async (url: string): Promise<string | null> => {
  console.log('Attempting to extract Place ID from URL:', url);

  try {
    let finalUrl = url;

    // Handle shortened URLs by resolving them first
    if (url.includes('g.co/kgs/') || url.includes('maps.app.goo.gl')) {
      console.log('Detected shortened URL format, attempting to resolve...');
      try {
        finalUrl = await resolveShortUrl(url);
        console.log('Successfully resolved shortened URL to:', finalUrl);
      } catch (error) {
        console.error('Failed to resolve shortened URL:', error);
        throw new Error('SHORTENED_URL_RESOLUTION_FAILED');
      }
    }

    const urlObj = new URL(finalUrl);
    const searchParams = new URLSearchParams(urlObj.search);
    
    // First try to get place_id from URL parameters
    if (searchParams.has('place_id')) {
      const placeId = searchParams.get('place_id');
      console.log('Found direct place_id:', placeId);
      return placeId;
    }

    // Try to extract from the URL path for newer format URLs
    const pathMatch = finalUrl.match(/place\/[^/]+\/([^/]+)/);
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
    const businessMatch = finalUrl.match(/!1s([^!]+)!8m2/);
    if (businessMatch && businessMatch[1].startsWith('0x')) {
      const placeId = decodeURIComponent(businessMatch[1]);
      console.log('Extracted Place ID from business listing:', placeId);
      return placeId;
    }

    console.log('No Place ID found in URL');
    return null;
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error);
    if (error instanceof Error && error.message === 'SHORTENED_URL_RESOLUTION_FAILED') {
      throw new Error('Failed to resolve the shortened URL. Please try again or use the full Google Maps URL.');
    }
    return null;
  }
};