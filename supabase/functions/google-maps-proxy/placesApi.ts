const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

export async function searchRestaurant(url?: string, placeId?: string): Promise<any> {
  console.log('🔍 Starting restaurant search with:', { url, placeId });
  
  if (!GOOGLE_API_KEY) {
    console.error('❌ Google Places API key is missing');
    throw new Error('Google Places API key is not configured');
  }

  try {
    // If placeId is provided, use it directly
    if (placeId) {
      console.log('🎯 Using provided place ID:', placeId);
      const details = await getPlaceDetails(placeId);
      if (!details?.result) {
        console.error('❌ No details found for place ID:', placeId);
        throw new Error('Restaurant details not found');
      }
      return details;
    }

    if (!url) {
      throw new Error('No URL or place ID provided');
    }

    // Clean and validate the URL
    let finalUrl = url;
    try {
      finalUrl = finalUrl.replace(/:\/?$/, '');
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }
      new URL(finalUrl);
    } catch (error) {
      console.error('❌ Invalid URL format:', error);
      throw new Error('Invalid URL format provided');
    }

    // Handle shortened URLs
    if (finalUrl.includes('goo.gl') || finalUrl.includes('maps.app.goo.gl')) {
      console.log('📎 Expanding shortened URL:', finalUrl);
      try {
        const response = await fetch(finalUrl, { 
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to expand URL: ${response.status}`);
        }
        finalUrl = response.url;
        console.log('📎 Expanded URL:', finalUrl);
      } catch (error) {
        console.error('❌ Error expanding shortened URL:', error);
        throw new Error('Failed to process shortened URL');
      }
    }

    // Extract coordinates from URL if available
    const coordsMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    let latitude: string | undefined;
    let longitude: string | undefined;
    
    if (coordsMatch) {
      latitude = coordsMatch[1];
      longitude = coordsMatch[2];
      console.log('📍 Extracted coordinates:', { latitude, longitude });
    }

    // Try to extract place ID from URL first
    try {
      const urlObj = new URL(finalUrl);
      const searchParams = new URLSearchParams(urlObj.search);
      const extractedPlaceId = searchParams.get('place_id') || 
                              finalUrl.match(/place\/[^/]+\/([^/?]+)/)?.[1];

      if (extractedPlaceId?.startsWith('ChIJ')) {
        console.log('🎯 Found place ID in URL:', extractedPlaceId);
        return await getPlaceDetails(extractedPlaceId);
      }
    } catch (error) {
      console.error('❌ Error parsing URL:', error);
      console.log('⚠️ Continuing with text search...');
    }

    // Extract search text and perform search
    const searchText = extractSearchText(finalUrl);
    console.log('🔍 Searching with text:', searchText);

    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('query', searchText);
    searchUrl.searchParams.set('type', 'restaurant');
    
    // Add location bias if coordinates are available
    if (latitude && longitude) {
      searchUrl.searchParams.set('location', `${latitude},${longitude}`);
      searchUrl.searchParams.set('radius', '1000'); // Search within 1km radius
      console.log('🎯 Adding location bias to search');
    }
    
    console.log('🌐 Making text search request');
    const response = await fetch(searchUrl.toString());
    if (!response.ok) {
      console.error('❌ Places API request failed:', response.status);
      throw new Error(`Places API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 Search response status:', data.status);
    
    if (!data.results?.[0]) {
      console.error('❌ No results found from text search:', data);
      throw new Error('Could not find restaurant. Please check the URL and try again.');
    }

    // If we have coordinates, verify the first result is within a reasonable distance
    if (latitude && longitude) {
      const result = data.results[0];
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        result.geometry.location.lat,
        result.geometry.location.lng
      );
      
      console.log('📏 Distance to first result:', distance, 'km');
      
      // If the first result is too far (more than 2km), log a warning
      if (distance > 2) {
        console.warn('⚠️ First result may be incorrect - distance:', distance, 'km');
      }
    }
    
    const foundPlaceId = data.results[0].place_id;
    console.log('✅ Found place ID:', foundPlaceId);
    return await getPlaceDetails(foundPlaceId);

  } catch (error) {
    console.error('❌ Error in searchRestaurant:', error);
    throw error;
  }
}

function extractSearchText(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Try different parameters where the search text might be
    const searchParams = [
      urlObj.searchParams.get('q'),
      urlObj.searchParams.get('query'),
      decodeURIComponent(urlObj.pathname.split('/place/')[1]?.split('/')[0] || '')
        .replace(/\+/g, ' ')
    ].filter(Boolean);

    const searchText = searchParams[0] || 
                      url.split('/place/')[1]?.split('/')[0]?.replace(/\+/g, ' ') || 
                      url;

    console.log('📝 Extracted search text:', searchText);
    return searchText;
  } catch (error) {
    console.log('⚠️ Error parsing URL, using full URL as search text');
    return url;
  }
}

async function getPlaceDetails(placeId: string): Promise<any> {
  console.log('🔍 Getting place details for ID:', placeId);
  
  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  detailsUrl.searchParams.set('place_id', placeId);
  detailsUrl.searchParams.set('fields', [
    'name',
    'rating',
    'formatted_address',
    'formatted_phone_number',
    'opening_hours',
    'website',
    'price_level',
    'photos',
    'reviews',
    'types',
    'user_ratings_total',
    'utc_offset',
    'place_id',
    'vicinity',
    'geometry'
  ].join(','));
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY);
  
  console.log('🌐 Making place details request');
  const response = await fetch(detailsUrl.toString());
  
  if (!response.ok) {
    console.error('❌ Place details request failed:', response.status);
    throw new Error(`Place details request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  console.log('📊 Place details response status:', data.status);
  
  if (data.status !== 'OK' || !data.result) {
    console.error('❌ Place Details API error:', data);
    throw new Error('Restaurant details not found');
  }

  console.log('✅ Successfully retrieved place details');
  return data;
}

// Helper function to calculate distance between two points using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}