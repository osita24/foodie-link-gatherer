export async function scanForMenuUrls(html: string, baseUrl: string): Promise<string[]> {
  console.log('🔍 Scanning for menu URLs in HTML content');
  
  const menuUrlPatterns = [
    /href="([^"]*menu[^"]*)"/, // Basic menu links
    /href="([^"]*food[^"]*)"/, // Food-related links
    /href="([^"]*dinner[^"]*)"/, // Dinner menu links
    /href="([^"]*lunch[^"]*)"/, // Lunch menu links
    /href="([^"]*breakfast[^"]*)"/, // Breakfast menu links
  ];

  const foundUrls = new Set<string>();

  menuUrlPatterns.forEach(pattern => {
    const matches = html.matchAll(new RegExp(pattern, 'gi'));
    for (const match of matches) {
      let url = match[1];
      
      // Handle relative URLs
      if (url.startsWith('/')) {
        url = `${baseUrl}${url}`;
      } else if (!url.startsWith('http')) {
        url = `${baseUrl}/${url}`;
      }

      // Only add URLs from the same domain
      if (url.startsWith(baseUrl)) {
        foundUrls.add(url);
      }
    }
  });

  console.log(`✨ Found ${foundUrls.size} potential menu URLs`);
  return Array.from(foundUrls);
}