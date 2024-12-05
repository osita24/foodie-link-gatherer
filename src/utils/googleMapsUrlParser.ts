interface ParsedMapUrl {
  type: 'query' | 'unknown';
  query?: string;
  originalUrl: string;
}

export const parseGoogleMapsUrl = async (url: string): Promise<ParsedMapUrl> => {
  console.log('Parsing URL:', url);
  
  try {
    return {
      type: 'query',
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