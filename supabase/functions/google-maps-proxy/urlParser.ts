import { LocationData, RestaurantSearchResult } from './types.ts';

export function parseGoogleMapsUrl(url: string): RestaurantSearchResult {
  console.log('🔍 Parsing Google Maps URL:', url);
  
  try {
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    let name = '';
    let location: LocationData = {};

    // Try to extract coordinates
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      location = {
        lat: parseFloat(coordsMatch[1]),
        lng: parseFloat(coordsMatch[2])
      };
      console.log('📍 Extracted coordinates:', location);
    }

    // Try to extract place name from different URL formats
    if (url.includes('/place/')) {
      const placeMatch = url.match(/place\/([^/@]+)/);
      if (placeMatch) {
        name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        name = name.split('/')[0]; // Remove any trailing parts
      }
    } else if (searchParams.has('q')) {
      name = searchParams.get('q') || '';
    }

    // Clean up the name
    name = name.replace(/\+/g, ' ').trim();
    console.log('🏪 Extracted restaurant name:', name);

    // Try to extract address from the URL path
    const pathSegments = urlObj.pathname.split('/');
    const addressSegment = pathSegments.find(segment => 
      segment.includes('+') || (segment.includes(',') && !segment.includes('@'))
    );
    
    if (addressSegment) {
      location.address = decodeURIComponent(addressSegment.replace(/\+/g, ' '));
      console.log('📍 Extracted address:', location.address);
    }

    return { name, location };
  } catch (error) {
    console.error('❌ Error parsing URL:', error);
    throw new Error(`Failed to parse Google Maps URL: ${error.message}`);
  }
}