// Map of foods to avoid and their related keywords
export const avoidanceKeywords: Record<string, string[]> = {
  'Shellfish': ['shrimp', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'crawfish', 'prawn'],
  'Peanuts': ['peanut', 'goober', 'groundnut', 'arachis'],
  'Tree Nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia', 'hazelnut', 'pine nut'],
  'Eggs': ['egg', 'omelette', 'frittata', 'quiche', 'mayonnaise', 'aioli'],
  'Soy': ['soy', 'tofu', 'edamame', 'tempeh', 'miso', 'tamari'],
  'Mushrooms': ['mushroom', 'shiitake', 'portobello', 'truffle', 'porcini', 'cremini', 'enoki'],
  'Bell Peppers': ['bell pepper', 'capsicum', 'sweet pepper', 'paprika'],
  'Raw Fish': ['sushi', 'sashimi', 'raw', 'tartare', 'ceviche', 'crudo', 'poke'],
  'Very Spicy': ['spicy', 'hot', 'chili', 'jalapeno', 'habanero', 'sriracha', 'wasabi', 'cayenne'],
  'Sweet Foods': [
    'sweet', 'dessert', 'candy', 'chocolate', 'sugar', 'syrup', 'honey', 'caramel',
    'frosting', 'glazed', 'pastry', 'cookie', 'cake', 'pie', 'ice cream', 'pudding'
  ],
  'Oily Foods': [
    'fried', 'deep-fried', 'pan-fried', 'oil', 'greasy', 'butter', 'fatty',
    'tempura', 'schnitzel', 'fritter', 'crispy', 'sautéed', 'deep fried'
  ],
  'Salty Foods': [
    'salt', 'soy sauce', 'fish sauce', 'miso', 'pickled', 'cured', 'brined',
    'preserved', 'teriyaki', 'bacon', 'ham', 'anchovy', 'capers', 'olives'
  ]
};

export const checkFoodsToAvoid = (itemContent: string, preferences: any): { matches: string[] } => {
  console.log("🔍 Checking foods to avoid for item:", itemContent);
  const foodsToAvoid = preferences.foodsToAvoid || [];
  const matches: string[] = [];
  
  for (const food of foodsToAvoid) {
    const keywords = avoidanceKeywords[food] || [food.toLowerCase()];
    for (const keyword of keywords) {
      if (itemContent.toLowerCase().includes(keyword.toLowerCase())) {
        console.log(`⚠️ Found avoided food: ${food} (keyword: ${keyword})`);
        if (!matches.includes(food)) {
          matches.push(food);
        }
      }
    }
  }

  return { matches };
};