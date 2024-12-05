import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves a shortened URL to its full form
 */
async function resolveShortUrl(url: string): Promise<string> {
  console.log('Attempting to resolve shortened URL:', url);
  
  const { data, error } = await supabase.functions.invoke('resolve-maps-url', {
    body: { url }
  });

  if (error) {
    console.error('Error resolving shortened URL:', error);
    throw new Error('SHORTENED_URL_RESOLUTION_FAILED');
  }

  if (!data?.resolvedUrl) {
    console.error('No resolved URL returned');
    throw new Error('SHORTENED_URL_RESOLUTION_FAILED');
  }

  console.log('Successfully resolved URL to:', data.resolvedUrl);
  return data.resolvedUrl;
}

/**
 * Converts an ftid to a Place ID format
 */
function convertFtidToPlaceId(ftid: string): string {
  // ftid format: 0x882b34d9289991d5:0x5f596deace8d8b6a
  // We need the second part after the colon
  const parts = ftid.split(':');
  if (parts.length !== 2) return '';
  
  // Convert the hex string to a Place ID format
  // Google uses base-16 numbers in ftid, which we need to convert to their Place ID format
  try {
    const placeIdHex = parts[1].replace('0x', '');
    // Convert pairs of hex characters to decimal and then to corresponding ASCII
    let placeId = 'ChIJ';
    for (let i = 0; i < placeIdHex.length; i += 2) {
      const hex = placeIdHex.substr(i, 2);
      const decimal = parseInt(hex, 16);
      placeId += String.fromCharCode(decimal);
    }
    console.log('Converted ftid to Place ID:', placeId);
    return placeId;
  } catch (error) {
    console.error('Error converting ftid to Place ID:', error);
    return '';
  }
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

    // Try to extract from ftid parameter (new format)
    const ftid = searchParams.get('ftid');
    if (ftid) {
      console.log('Found ftid:', ftid);
      const placeId = convertFtidToPlaceId(ftid);
      if (placeId && placeId.startsWith('ChIJ')) {
        console.log('Successfully converted ftid to Place ID:', placeId);
        return placeId;
      }
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
      throw error;
    }
    return null;
  }
};