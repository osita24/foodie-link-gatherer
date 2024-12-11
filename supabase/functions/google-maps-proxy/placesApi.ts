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
      return await getPlaceDetails(placeId);
    }

    if (!url) {
      throw new Error('No URL or place ID provided');
    }

    // Clean and validate the URL
    let finalUrl = url.trim();
    console.log('🔍 Processing URL:', finalUrl);

    // Handle direct place IDs that might be passed as URLs
    if (finalUrl.startsWith('ChIJ')) {
      console.log('🎯 Direct place ID detected:', finalUrl);
      return await getPlaceDetails(finalUrl);
    }

    try {
      // Remove any trailing colons without port numbers
      finalUrl = finalUrl.replace(/:\/?$/, '');
      
      // Ensure the URL has a valid protocol
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }

      // Validate URL format
      new URL(finalUrl);
    } catch (error) {
      console.error('❌ Invalid URL format:', error);
      throw new Error('Invalid URL format provided');
    }

    // Try to extract place ID from URL
    try {
      const urlObj = new URL(finalUrl);
      const searchParams = new URLSearchParams(urlObj.search);
      
      // Check for place_id in URL parameters
      const extractedPlaceId = searchParams.get('place_id');
      if (extractedPlaceId) {
        console.log('🎯 Found place ID in URL parameters:', extractedPlaceId);
        return await getPlaceDetails(extractedPlaceId);
      }

      // Check for place ID in URL path
      const placeMatch = finalUrl.match(/place\/[^/]+\/([^/?]+)/);
      if (placeMatch && placeMatch[1]?.startsWith('ChIJ')) {
        console.log('🎯 Found place ID in URL path:', placeMatch[1]);
        return await getPlaceDetails(placeMatch[1]);
      }

      // Extract search text for fallback
      const searchText = extractSearchText(finalUrl);
      console.log('🔍 Falling back to text search with:', searchText);

      const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      searchUrl.searchParams.set('key', GOOGLE_API_KEY);
      searchUrl.searchParams.set('query', searchText);
      searchUrl.searchParams.set('type', 'restaurant');
      
      console.log('🌐 Making text search request');
      const response = await fetch(searchUrl.toString());
      
      if (!response.ok) {
        console.error('❌ Places API request failed:', response.status);
        throw new Error(`Places API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Search response status:', data.status);
      
      if (data.status === 'ZERO_RESULTS') {
        throw new Error(`No restaurant found matching: ${searchText}`);
      }
      
      if (data.status !== 'OK' || !data.results?.[0]) {
        console.error('❌ Places API error:', data);
        throw new Error(`Places API error: ${data.status}`);
      }
      
      const foundPlaceId = data.results[0].place_id;
      console.log('✅ Found place ID:', foundPlaceId);
      return await getPlaceDetails(foundPlaceId);
    } catch (error) {
      console.error('❌ Error processing URL:', error);
      throw error;
    }
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
    'vicinity'
  ].join(','));
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY);
  
  console.log('🌐 Making place details request');
  const response = await fetch(detailsUrl.toString());
  
  if (!response.ok) {
    console.error('❌ Place details request failed:', response.status);
    throw new Error(`Place details request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status !== 'OK') {
    console.error('❌ Place Details API error:', data);
    throw new Error(`Place Details API error: ${data.status}`);
  }

  console.log('✅ Successfully retrieved place details');
  return data;
}