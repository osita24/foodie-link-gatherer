interface ProteinMatch {
  matches: string[];
  score: number;
}

const proteinTerms: Record<string, string[]> = {
  'chicken': ['chicken', 'poultry', 'fowl', 'hen', 'rooster', 'bird'],
  'beef': ['beef', 'steak', 'burger', 'ribeye', 'sirloin', 'tenderloin', 'brisket', 'cow'],
  'fish': ['fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'bass', 'seafood', 'mahi'],
  'pork': ['pork', 'ham', 'bacon', 'prosciutto', 'pig', 'ribs', 'belly'],
  'lamb': ['lamb', 'mutton', 'sheep'],
  'tofu': ['tofu', 'soy protein', 'tempeh', 'seitan'],
  'turkey': ['turkey'],
  'eggs': ['egg', 'eggs', 'omelette', 'frittata']
};

export function analyzeProteinContent(
  itemContent: string,
  favoriteProteins: string[]
): ProteinMatch {
  console.log('🥩 Analyzing protein content for:', itemContent);
  console.log('👤 User protein preferences:', favoriteProteins);

  const matches: string[] = [];
  
  for (const protein of favoriteProteins) {
    const proteinLower = protein.toLowerCase();
    if (proteinLower === "doesn't apply") continue;

    const termsToCheck = proteinTerms[proteinLower] || [proteinLower];
    const found = termsToCheck.some(term => 
      itemContent.toLowerCase().includes(term)
    );

    if (found) {
      matches.push(protein);
      console.log(`✅ Found matching protein: ${protein}`);
    }
  }

  // Score based on matches (30 points per match, max 40)
  const score = Math.min(matches.length * 30, 40);
  
  return { matches, score };
}