export async function identifyMenuPhotos(photos: any[]): Promise<string[]> {
  console.log('Identifying menu photos from:', photos.length, 'photos');
  
  // Filter photos that might be menus based on their attributes
  const potentialMenuPhotos = photos.filter(photo => {
    // Check if photo has text-heavy attributes or menu-related tags
    const isMenuPhoto = photo.html_attributions?.some((attr: string) => 
      attr.toLowerCase().includes('menu') ||
      attr.toLowerCase().includes('food') ||
      attr.toLowerCase().includes('dish')
    );
    
    if (isMenuPhoto) {
      console.log('Found potential menu photo:', photo.photo_reference);
    }
    
    return isMenuPhoto;
  });

  console.log(`Identified ${potentialMenuPhotos.length} potential menu photos`);
  return potentialMenuPhotos.map(photo => photo.photo_reference);
}