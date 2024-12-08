interface DietaryMatch {
  isCompatible: boolean;
  conflicts: string[];
}

const dietaryTerms: Record<string, string[]> = {
  'vegetarian': ['meat', 'chicken', 'beef', 'pork', 'fish', 'prosciutto', 'bacon', 'ham'],
  'vegan': ['meat', 'chicken', 'beef', 'pork', 'fish', 'egg', 'dairy', 'milk', 'cheese', 'cream', 'butter', 'honey'],
  'gluten-free': ['wheat', 'gluten', 'bread', 'pasta', 'flour', 'soy sauce', 'breadcrumbs'],
  'dairy-free': ['milk', 'cheese', 'cream', 'dairy', 'butter', 'yogurt', 'parmesan', 'mozzarella'],
  'halal': ['pork', 'bacon', 'ham', 'alcohol', 'wine', 'beer'],
  'kosher': ['pork', 'shellfish', 'rabbit']
};

export function analyzeDietaryCompatibility(
  itemContent: string,
  dietaryRestrictions: string[]
): DietaryMatch {
  console.log('🥗 Analyzing dietary compatibility for:', itemContent);
  console.log('👤 User dietary restrictions:', dietaryRestrictions);

  const conflicts: string[] = [];
  
  for (const restriction of dietaryRestrictions) {
    const restrictionLower = restriction.toLowerCase();
    if (restrictionLower === 'no restrictions') continue;

    const termsToCheck = dietaryTerms[restrictionLower] || [restrictionLower];
    const foundConflicts = termsToCheck.filter(term => 
      itemContent.toLowerCase().includes(term)
    );

    if (foundConflicts.length > 0) {
      conflicts.push(restriction);
      console.log(`⚠️ Found dietary conflict for ${restriction}:`, foundConflicts);
    }
  }

  return {
    isCompatible: conflicts.length === 0,
    conflicts
  };
}