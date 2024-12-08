import { MenuCategory } from "@/types/restaurant";

export const analyzeMenuData = (
  menuData: MenuCategory[],
  preferences: any
): MenuCategory[] => {
  if (!menuData?.[0]?.items) return menuData;

  console.log("📊 Analyzing menu data with preferences:", preferences);

  const analyzedItems = menuData[0].items.map(item => {
    // Calculate base relevance score
    let relevanceScore = 50;
    const itemText = `${item.name} ${item.description || ''}`.toLowerCase();

    // Analyze dietary compatibility
    if (preferences.dietary_restrictions?.length) {
      const isCompatible = !preferences.dietary_restrictions.some((restriction: string) =>
        itemText.includes(restriction.toLowerCase())
      );
      if (isCompatible) relevanceScore += 20;
    }

    // Analyze cuisine preferences
    if (preferences.cuisine_preferences?.length) {
      const matchesCuisine = preferences.cuisine_preferences.some((cuisine: string) =>
        itemText.includes(cuisine.toLowerCase())
      );
      if (matchesCuisine) relevanceScore += 15;
    }

    return {
      ...item,
      relevanceScore
    };
  });

  // Sort items by relevance
  const sortedItems = analyzedItems.sort((a, b) => 
    (b.relevanceScore || 0) - (a.relevanceScore || 0)
  );

  console.log(`✅ Analyzed ${sortedItems.length} menu items`);

  return [{
    ...menuData[0],
    items: sortedItems
  }];
};