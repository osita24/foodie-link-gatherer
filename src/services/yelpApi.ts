const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com';

export const fetchYelpMenuData = async (restaurantName: string, location: string) => {
  console.log('Fetching Yelp data for:', restaurantName, location);
  
  if (!YELP_API_KEY) {
    console.warn('Yelp API key not configured');
    return null;
  }

  try {
    // First, search for the restaurant to get its Yelp ID
    const searchResponse = await fetch(
      `${CORS_PROXY}/https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(restaurantName)}&location=${encodeURIComponent(location)}`,
      {
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
        }
      }
    );

    const searchData = await searchResponse.json();
    const businessId = searchData.businesses?.[0]?.id;

    if (!businessId) {
      console.log('No Yelp business found for:', restaurantName);
      return null;
    }

    // Then fetch detailed business data including menu items if available
    const detailsResponse = await fetch(
      `${CORS_PROXY}/https://api.yelp.com/v3/businesses/${businessId}`,
      {
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
        }
      }
    );

    const detailsData = await detailsResponse.json();
    console.log('Yelp API response:', detailsData);

    return detailsData;
  } catch (error) {
    console.error('Error fetching Yelp data:', error);
    return null;
  }
};