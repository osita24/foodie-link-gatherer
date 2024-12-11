const dietaryKeywords: Record<string, string[]> = {
  'Vegetarian': [
    'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb', 
    'turkey', 'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni', 
    'anchovy', 'duck', 'veal', 'foie gras', 'chorizo', 'sausage'
  ],
  'Vegan': [
    'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb',
    'cheese', 'cream', 'milk', 'egg', 'butter', 'honey', 'yogurt',
    'mayo', 'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni',
    'anchovy', 'duck', 'veal', 'foie gras', 'chorizo', 'sausage',
    'gelatin', 'whey', 'casein', 'ghee', 'lard', 'aioli'
  ],
  'Gluten-Free': [
    'bread', 'pasta', 'flour', 'wheat', 'tortilla', 'breaded',
    'crusted', 'battered', 'soy sauce', 'teriyaki', 'noodles',
    'ramen', 'udon', 'couscous', 'barley', 'malt', 'seitan', 'panko'
  ],
  'Dairy-Free': [
    'cheese', 'cream', 'milk', 'butter', 'yogurt', 'mayo',
    'parmesan', 'mozzarella', 'ricotta', 'alfredo', 'béchamel',
    'queso', 'crema', 'burrata', 'mascarpone', 'provolone'
  ]
};

export const checkDietaryConflicts = (itemContent: string, preferences: any): string | null => {
  const dietaryRestrictions = preferences.dietary_restrictions || [];
  
  for (const restriction of dietaryRestrictions) {
    const keywords = dietaryKeywords[restriction] || [restriction.toLowerCase()];
    for (const keyword of keywords) {
      if (itemContent.toLowerCase().includes(keyword.toLowerCase())) {
        console.log(`❌ Found dietary conflict: ${restriction} (keyword: ${keyword})`);
        return restriction;
      }
    }
  }

  return null;
};