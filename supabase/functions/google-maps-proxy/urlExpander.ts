export async function expandUrl(url: string): Promise<string> {
  console.log('🔄 Input URL to expand:', url);
  
  // If it's not a shortened URL, return as is
  if (!url.includes('goo.gl') && !url.includes('maps.app.goo.gl')) {
    console.log('📎 URL is not shortened, returning as is:', url);
    return url;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to expand URL: ${response.status}`);
    }
    
    const expandedUrl = response.url;
    console.log('✨ URL expanded to:', expandedUrl);
    return expandedUrl;
  } catch (error) {
    console.error('❌ Error expanding URL:', error);
    throw new Error(`Failed to expand URL: ${error.message}`);
  }
}