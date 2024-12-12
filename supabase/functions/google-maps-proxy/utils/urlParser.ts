export async function expandShortUrl(url: string): Promise<string> {
  console.log('📎 Expanding shortened URL:', url);
  try {
    const response = await fetch(url, { 
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to expand URL: ${response.status}`);
    }
    console.log('📎 Expanded URL:', response.url);
    return response.url;
  } catch (error) {
    console.error('❌ Error expanding shortened URL:', error);
    throw new Error('Failed to process shortened URL');
  }
}

export function cleanUrl(url: string): string {
  let finalUrl = url.replace(/:\/?$/, '');
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = `https://${finalUrl}`;
  }
  try {
    new URL(finalUrl);
    return finalUrl;
  } catch (error) {
    throw new Error('Invalid URL format provided');
  }
}

export function extractCoordinates(url: string): { lat?: string; lng?: string } {
  const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    console.log('📍 Extracted coordinates:', { lat: coordsMatch[1], lng: coordsMatch[2] });
    return { lat: coordsMatch[1], lng: coordsMatch[2] };
  }
  return {};
}

export function extractPlaceId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    const placeId = searchParams.get('place_id') || 
                    url.match(/place\/[^/]+\/([^/?]+)/)?.[1];

    if (placeId?.startsWith('ChIJ')) {
      console.log('🎯 Found place ID in URL:', placeId);
      return placeId;
    }
    return null;
  } catch (error) {
    console.error('❌ Error extracting place ID:', error);
    return null;
  }
}