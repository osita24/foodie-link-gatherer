import { LocationData, RestaurantSearchResult } from './types.ts';

export function extractRestaurantInfo(url: string): RestaurantSearchResult {
  console.log('🔍 Parsing Google Maps URL:', url);
  
  try {
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    
    // Try to get info from the 'q' parameter first (most common format)
    let fullQuery = searchParams.get('q') || '';
    
    // If no 'q' parameter, try to get from the URL path
    if (!fullQuery && url.includes('/place/')) {
      const placeMatch = url.match(/place\/([^/@]+)/);
      if (placeMatch) {
        fullQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }
    }

    // If still no query found, try other parameters
    if (!fullQuery) {
      fullQuery = searchParams.get('query') || 
                 searchParams.get('destination') || 
                 '';
    }

    if (!fullQuery) {
      throw new Error('Could not extract restaurant information from URL');
    }

    // Clean up the query
    fullQuery = decodeURIComponent(fullQuery.replace(/\+/g, ' '));
    console.log('📝 Full query string:', fullQuery);

    // Split into name and address
    // Usually format is "Restaurant Name, Address"
    const parts = fullQuery.split(',');
    const name = parts[0].trim();
    
    // Join the rest as the address
    const address = parts.slice(1).join(',').trim();

    // Try to extract coordinates if available
    const location: LocationData = {};
    if (address) {
      location.address = address;
    }

    // Try to extract coordinates from URL
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      location.lat = parseFloat(coordsMatch[1]);
      location.lng = parseFloat(coordsMatch[2]);
    }

    console.log('✨ Extracted info:', { name, location });
    return { name, location };
  } catch (error) {
    console.error('❌ Error parsing URL:', error);
    throw new Error(`Failed to parse Google Maps URL: ${error.message}`);
  }
}