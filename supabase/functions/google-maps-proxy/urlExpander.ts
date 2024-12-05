export async function expandUrl(url: string): Promise<string> {
  console.log('🔄 Expanding URL:', url);
  
  // If it's not a shortened URL, return as is
  if (!url.includes('goo.gl') && !url.includes('maps.app.goo.gl')) {
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
    console.log('✨ URL expanded successfully:', expandedUrl);
    return expandedUrl;
  } catch (error) {
    console.error('❌ Error expanding URL:', error);
    throw new Error(`Failed to expand URL: ${error.message}`);
  }
}