interface CuisineMatch {
  matches: string[];
  score: number;
}

const cuisineTerms: Record<string, string[]> = {
  'italian': ['pasta', 'pizza', 'risotto', 'parmigiana', 'marinara', 'pesto', 'gnocchi', 'carbonara', 'lasagna', 'tiramisu', 'bruschetta', 'antipasto'],
  'mexican': ['taco', 'burrito', 'quesadilla', 'enchilada', 'salsa', 'guacamole', 'tortilla', 'fajita', 'chile', 'mole', 'pozole'],
  'chinese': ['wonton', 'dumpling', 'noodle', 'stir-fry', 'soy sauce', 'kung pao', 'mapo', 'dim sum', 'fried rice', 'chow mein'],
  'japanese': ['sushi', 'ramen', 'tempura', 'udon', 'teriyaki', 'miso', 'sashimi', 'katsu', 'yakitori', 'donburi'],
  'indian': ['curry', 'masala', 'tandoori', 'naan', 'biryani', 'tikka', 'vindaloo', 'samosa', 'dal', 'korma', 'paneer'],
  'thai': ['curry', 'pad thai', 'satay', 'coconut', 'basil', 'tom yum', 'som tam', 'larb', 'massaman'],
  'mediterranean': ['hummus', 'falafel', 'pita', 'kebab', 'shawarma', 'tzatziki', 'tabbouleh', 'dolma'],
  'french': ['croissant', 'baguette', 'ratatouille', 'coq au vin', 'bouillabaisse', 'cassoulet', 'quiche'],
  'korean': ['kimchi', 'bulgogi', 'bibimbap', 'gochujang', 'galbi', 'japchae', 'tteokbokki'],
  'vietnamese': ['pho', 'banh mi', 'spring roll', 'rice paper', 'fish sauce', 'nuoc mam']
};

export function analyzeCuisineMatch(
  itemContent: string,
  cuisinePreferences: string[]
): CuisineMatch {
  console.log('🍽️ Analyzing cuisine match for:', itemContent);
  console.log('👤 User cuisine preferences:', cuisinePreferences);

  const matches: string[] = [];
  
  for (const cuisine of cuisinePreferences) {
    const cuisineLower = cuisine.toLowerCase();
    const termsToCheck = cuisineTerms[cuisineLower] || [cuisineLower];
    
    const found = termsToCheck.some(term => 
      itemContent.toLowerCase().includes(term)
    );

    if (found) {
      matches.push(cuisine);
      console.log(`✅ Found matching cuisine: ${cuisine}`);
    }
  }

  // Score based on matches (25 points per match, max 35)
  const score = Math.min(matches.length * 25, 35);
  
  return { matches, score };
}