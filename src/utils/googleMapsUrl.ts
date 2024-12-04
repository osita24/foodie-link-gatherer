/**
 * Extracts place ID from various Google Maps URL formats
 */
export const extractPlaceId = async (url: string): Promise<string | null> => {
  console.log('Attempting to extract Place ID from URL:', url);

  try {
    // Handle shortened g.co links
    if (url.includes('g.co/kgs/')) {
      console.log('Detected shortened g.co URL, attempting to handle...');
      const identifier = url.split('g.co/kgs/')[1];
      if (!identifier) {
        console.error('Could not extract identifier from shortened URL');
        return null;
      }
      console.log('Extracted identifier:', identifier);
      return identifier;
    }

    // Handle regular Google Maps URLs
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    
    // Check for cid parameter (unique identifier)
    if (searchParams.has('cid')) {
      const cid = searchParams.get('cid');
      console.log('Found cid parameter:', cid);
      return `place_id:${cid}`;
    }

    // Check for place_id parameter
    if (searchParams.has('place_id')) {
      const placeId = searchParams.get('place_id');
      console.log('Found direct place_id:', placeId);
      return placeId;
    }

    // Check for ftid parameter (specific restaurant ID)
    if (searchParams.has('ftid')) {
      const ftid = searchParams.get('ftid');
      console.log('Found ftid parameter:', ftid);
      // Extract the business reference ID
      const businessRef = ftid?.split(':')[0];
      if (businessRef) {
        console.log('Extracted business reference:', businessRef);
        return businessRef;
      }
    }

    // Check for q parameter (search query with place details)
    if (searchParams.has('q')) {
      const query = searchParams.get('q');
      console.log('Found q parameter:', query);
      
      // If q parameter contains a place_id
      if (query?.includes('place_id:')) {
        const placeId = query.split('place_id:')[1];
        console.log('Extracted Place ID from q parameter:', placeId);
        return placeId;
      }
    }
    
    // Format: maps/place/.../@...,17z/data=!3m1!4b1!4m5!3m4!1s0x...
    const matches = url.match(/!1s([^!]+)!/);
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