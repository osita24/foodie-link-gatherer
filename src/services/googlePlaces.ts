import { RestaurantDetails } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com';

/**
 * Resolves a shortened Google Maps URL to its full form
 */
const resolveShortUrl = async (url: string): Promise<string> => {
  console.log('Resolving shortened URL:', url);
  
  // First try using our Supabase Edge Function to resolve the URL
  try {
    const { data, error } = await supabase.functions.invoke('resolve-maps-url', {
      body: { url }
    });

    if (error) {
      console.error('Error resolving URL via Edge Function:', error);
      throw error;
    }

    if (data?.resolvedUrl) {
      console.log('Successfully resolved URL to:', data.resolvedUrl);
      return data.resolvedUrl;
    }
  } catch (error) {
    console.error('Failed to resolve URL:', error);
    throw new Error('URL_RESOLUTION_FAILED');
  }

  throw new Error('Could not resolve shortened URL');
};

/**
 * Extracts search query from Google Maps URL
 */
const extractSearchQuery = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    
    // Try to get the place name from various URL parameters
    const searchParams = new URLSearchParams(urlObj.search);
    const query = searchParams.get('q') || 
                 urlObj.pathname.split('/').filter(Boolean).pop() || 
                 '';
                 
    if (query) {
      console.log('Extracted search query:', query);
      return decodeURIComponent(query).replace(/\+/g, ' ');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting search query:', error);
    return null;
  }
};

/**
 * Searches for a place using the Places API
 */
const searchPlace = async (query: string): Promise<string | null> => {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google Places API key not configured');
  }

  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `${CORS_PROXY}/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodedQuery}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_API_KEY}`;
  
  console.log('Searching for place with query:', query);
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (data.status === 'OK' && data.candidates?.length > 0) {
    const placeId = data.candidates[0].place_id;
    console.log('Found place ID:', placeId);
    return placeId;
  }
  
  return null;
};

export const extractPlaceId = async (input: string): Promise<string | null> => {
  console.log('Processing input:', input);
  
  try {
    // If input is a shortened URL, resolve it first
    if (input.includes('goo.gl/') || input.includes('maps.app.goo.gl')) {
      console.log('Detected shortened URL, resolving...');
      input = await resolveShortUrl(input);
    }
    
    // Try to extract a search query from the URL
    const searchQuery = extractSearchQuery(input);
    if (searchQuery) {
      console.log('Attempting to search for place using query:', searchQuery);
      const placeId = await searchPlace(searchQuery);
      if (placeId) {
        return placeId;
      }
    }
    
    throw new Error('Could not extract place information');
  } catch (error) {
    console.error('Error processing input:', error);
    throw error;
  }
};

export const fetchRestaurantDetails = async (inputId: string): Promise<RestaurantDetails> => {
  console.log('Fetching details for:', inputId);
  
  try {
    const placeId = await extractPlaceId(inputId);
    if (!placeId) {
      throw new Error('Could not determine place ID');
    }

    if (!GOOGLE_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const fields = [
      'name',
      'rating',
      'user_ratings_total',
      'formatted_address',
      'formatted_phone_number',
      'opening_hours',
      'website',
      'price_level',
      'photos',
      'reviews',
      'types',
      'vicinity',
      'utc_offset'
    ].join(',');

    const apiUrl = `${CORS_PROXY}/https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch restaurant details: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (data.status !== 'OK' || !data.result) {
      throw new Error('No restaurant data found');
    }

    // Create photo URLs
    const photoUrls = data.result.photos?.map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
    ) || [];

    // Process hours
    let hoursText = 'Hours not available';
    if (data.result.opening_hours?.weekday_text?.length > 0) {
      hoursText = data.result.opening_hours.weekday_text.join(' | ');
    }

    return {
      id: placeId,
      name: data.result.name,
      rating: data.result.rating || 0,
      reviews: data.result.user_ratings_total || 0,
      address: data.result.formatted_address || data.result.vicinity || 'Address Not Available',
      hours: hoursText,
      phone: data.result.formatted_phone_number || '',
      website: data.result.website || '',
      photos: photoUrls,
      priceLevel: data.result.price_level || 0,
      openingHours: data.result.opening_hours ? {
        periods: data.result.opening_hours.periods || [],
        weekdayText: data.result.opening_hours.weekday_text || [],
      } : undefined,
      vicinity: data.result.vicinity || '',
      types: data.result.types || [],
      userRatingsTotal: data.result.user_ratings_total || 0,
      utcOffset: data.result.utc_offset,
      googleReviews: data.result.reviews || []
    };
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    throw error;
  }
};