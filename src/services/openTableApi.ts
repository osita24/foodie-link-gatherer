const OPENTABLE_API_KEY = import.meta.env.VITE_OPENTABLE_API_KEY;

export const fetchOpenTableMenuData = async (restaurantName: string, location: string) => {
  console.log('Fetching OpenTable data for:', restaurantName, location);
  
  if (!OPENTABLE_API_KEY) {
    console.warn('OpenTable API key not configured');
    return null;
  }

  try {
    // Search for restaurant in OpenTable
    const response = await fetch(
      `https://platform.opentable.com/sync/listings/search?term=${encodeURIComponent(restaurantName)}&location=${encodeURIComponent(location)}`,
      {
        headers: {
          'Authorization': `Bearer ${OPENTABLE_API_KEY}`,
        }
      }
    );

    const data = await response.json();
    console.log('OpenTable API response:', data);

    return data;
  } catch (error) {
    console.error('Error fetching OpenTable data:', error);
    return null;
  }
};