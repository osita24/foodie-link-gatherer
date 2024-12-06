export async function identifyMenuPhotos(photos: any[]): Promise<string[]> {
  // Filter photos that are likely to be menus based on metadata
  const menuPhotos = photos.filter(photo => {
    // Check if photo has certain attributes that might indicate it's a menu
    const isLikelyMenu = 
      // Typically menus are in portrait orientation
      (photo.height > photo.width) &&
      // Menus usually have text
      photo.html_attributions?.some((attr: string) => 
        attr.toLowerCase().includes('menu') ||
        attr.toLowerCase().includes('food')
      );
    
    return isLikelyMenu;
  });

  console.log(`Identified ${menuPhotos.length} potential menu photos`);
  
  // Return the photo references
  return menuPhotos.map(photo => photo.photo_reference);
}