export async function identifyMenuPhotos(photos: any[]): Promise<string[]> {
  // Filter photos that might be menus based on their attributes
  const potentialMenuPhotos = photos.filter(photo => {
    // Check if photo has menu-related attributes
    const hasMenuAttributes = photo.html_attributions?.some((attr: string) => 
      attr.toLowerCase().includes('menu') ||
      attr.toLowerCase().includes('food list') ||
      attr.toLowerCase().includes('price')
    );

    // Check if photo dimensions suggest it might be a menu (typically taller than wide)
    const isMenuShape = photo.height > photo.width;

    return hasMenuAttributes || isMenuShape;
  });

  // Return photo references for potential menu photos
  return potentialMenuPhotos.map(photo => photo.photo_reference);
}