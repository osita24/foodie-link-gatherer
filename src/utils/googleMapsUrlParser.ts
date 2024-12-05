interface ParsedMapUrl {
  type: 'query' | 'unknown';
  query?: string;
  originalUrl: string;
}

export const parseGoogleMapsUrl = async (url: string): Promise<ParsedMapUrl> => {
  console.log('Parsing Google Maps URL:', url);
  
  try {
    // For shortened URLs, we'll expand them in the Edge Function
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      console.log('Detected shortened URL');
      return {
        type: 'query',
        originalUrl: url
      };
    }

    // For regular URLs, extract the query parameter
    const urlObj = new URL(url);
    const query = urlObj.searchParams.get('q');
    
    if (query) {
      console.log('Found query in URL:', query);
      return {
        type: 'query',
        query,
        originalUrl: url
      };
    }

    console.log('No query found in URL');
    return {
      type: 'unknown',
      originalUrl: url
    };
  } catch (error) {
    console.error('Error parsing URL:', error);
    return {
      type: 'unknown',
      originalUrl: url
    };
  }
};