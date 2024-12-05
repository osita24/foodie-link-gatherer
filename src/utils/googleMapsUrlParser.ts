/**
 * Utility functions for parsing and handling Google Maps URLs
 */
import { supabase } from "@/integrations/supabase/client";

// Common URL patterns for Google Maps
const URL_PATTERNS = {
  SHORTENED: /^https?:\/\/(goo\.gl\/maps|maps\.app\.goo\.gl|g\.co\/kgs)\/.+/i,
  PLACE_ID: /!1s(ChIJ[^!]+)/,
  PLACE_ID_PARAM: /place_id=([^&]+)/,
  COORDINATES: /@(-?\d+\.\d+),(-?\d+\.\d+)/,
  CID: /!3m7!1s(\d+)!/,
  FTID: /ftid=([^&]+)/,
  HEX_ID: /0x[a-fA-F0-9]+:0x[a-fA-F0-9]+/,
};

interface ParsedMapUrl {
  type: 'place_id' | 'coordinates' | 'shortened' | 'unknown';
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  originalUrl: string;
}

/**
 * Resolves a shortened URL to its full form using our Edge Function
 */
const resolveShortUrl = async (url: string): Promise<string> => {
  console.log('Resolving shortened URL:', url);
  try {
    const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
      body: { 
        action: 'expand_url',
        url: url 
      }
    });

    if (error) {
      console.error('Error expanding URL:', error);
      throw new Error('Failed to expand shortened URL');
    }

    if (!data?.expandedUrl) {
      throw new Error('No expanded URL returned');
    }

    console.log('Expanded URL:', data.expandedUrl);
    return data.expandedUrl;
  } catch (error) {
    console.error('Error resolving shortened URL:', error);
    throw new Error('Failed to resolve shortened URL');
  }
};

/**
 * Extracts coordinates from a Google Maps URL
 */
const extractCoordinates = (url: string) => {
  const matches = url.match(URL_PATTERNS.COORDINATES);
  if (matches && matches[1] && matches[2]) {
    return {
      lat: parseFloat(matches[1]),
      lng: parseFloat(matches[2]),
    };
  }
  return null;
};

/**
 * Converts a hex format place ID to a ChIJ format
 * Example: 0x882b34d9289991d5:0x5f596deace8d8b6a -> ChIJ1ZGZKNk0K4gRaq2N7lZZX18
 */
const convertHexToChIJ = (hexId: string): string => {
  // Remove the '0x' prefix and split into two parts
  const [part1, part2] = hexId.split(':').map(part => part.replace('0x', ''));
  
  // Convert hex strings to decimal
  const num1 = BigInt('0x' + part1);
  const num2 = BigInt('0x' + part2);
  
  // Convert to base32 string
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = 'ChIJ';
  
  // Convert first part
  let n = num1;
  while (n > 0n) {
    result += base32Chars[Number(n & 31n)];
    n >>= 5n;
  }
  
  // Convert second part
  n = num2;
  while (n > 0n) {
    result += base32Chars[Number(n & 31n)];
    n >>= 5n;
  }
  
  return result;
};

/**
 * Extracts and formats place ID from various URL formats
 */
const extractPlaceId = (url: string): string | null => {
  // Try to get place_id parameter first
  const placeIdMatch = url.match(URL_PATTERNS.PLACE_ID_PARAM);
  if (placeIdMatch?.[1]) {
    console.log('Found place_id parameter:', placeIdMatch[1]);
    return placeIdMatch[1];
  }

  // Try to extract hex format ID
  const hexMatch = url.match(URL_PATTERNS.HEX_ID);
  if (hexMatch?.[0]) {
    const chijId = convertHexToChIJ(hexMatch[0]);
    console.log('Converted hex ID to ChIJ format:', chijId);
    return chijId;
  }

  // Try to get FTID parameter
  const ftidMatch = url.match(URL_PATTERNS.FTID);
  if (ftidMatch?.[1]) {
    const chijId = convertHexToChIJ(ftidMatch[1]);
    console.log('Converted FTID to ChIJ format:', chijId);
    return chijId;
  }

  // Try to get ChIJ format
  const chijMatch = url.match(URL_PATTERNS.PLACE_ID);
  if (chijMatch?.[1]) {
    console.log('Found ChIJ format:', chijMatch[1]);
    return chijMatch[1];
  }

  return null;
};

/**
 * Main function to parse any Google Maps URL
 */
export const parseGoogleMapsUrl = async (url: string): Promise<ParsedMapUrl> => {
  console.log('Parsing Google Maps URL:', url);
  let finalUrl = url;

  try {
    // Handle shortened URLs
    if (URL_PATTERNS.SHORTENED.test(url)) {
      console.log('Detected shortened URL, resolving...');
      finalUrl = await resolveShortUrl(url);
    }

    // Try to extract place ID first
    const placeId = extractPlaceId(finalUrl);
    if (placeId) {
      console.log('Found place ID:', placeId);
      return {
        type: 'place_id',
        placeId,
        originalUrl: url,
      };
    }

    // Try to extract coordinates
    const coordinates = extractCoordinates(finalUrl);
    if (coordinates) {
      console.log('Found coordinates:', coordinates);
      return {
        type: 'coordinates',
        coordinates,
        originalUrl: url,
      };
    }

    // If it's still a shortened URL but we couldn't extract information
    if (URL_PATTERNS.SHORTENED.test(url)) {
      return {
        type: 'shortened',
        originalUrl: url,
      };
    }

    console.log('Could not parse URL format');
    return {
      type: 'unknown',
      originalUrl: url,
    };
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error);
    throw error;
  }
};