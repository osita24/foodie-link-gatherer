export interface MatchResult {
  matchType: 'perfect' | 'good' | 'neutral' | 'warning';
  reason?: string;
  warning?: string;
}

export const resolveMatchType = (
  score: number,
  factors: any,
  itemContent: string
): MatchResult => {
  console.log('🎯 Resolving match type for score:', score, 'with factors:', factors);

  if (score <= 30) {
    return {
      matchType: 'warning',
      warning: 'May not match your preferences'
    };
  }

  if (score >= 90) {
    const reason = determineHighMatchReason(factors, itemContent);
    return {
      matchType: 'perfect',
      reason: `Perfect match: ${reason}`
    };
  }

  if (score >= 75) {
    const reason = determineGoodMatchReason(factors, itemContent);
    return {
      matchType: 'good',
      reason: `Great choice: ${reason}`
    };
  }

  // Enhanced neutral match messaging
  const neutralReason = determineNeutralMatchReason(factors, itemContent);
  return {
    matchType: 'neutral',
    reason: neutralReason
  };
};

const determineHighMatchReason = (factors: any, itemContent: string): string => {
  if (factors.proteinMatch > 0) {
    return 'Features your preferred protein';
  }
  if (factors.cuisineMatch > 0) {
    return 'Matches your favorite cuisine style';
  }
  if (factors.preparationMatch > 15) {
    return 'Prepared in your preferred style';
  }
  return 'Highly aligned with your preferences';
};

const determineGoodMatchReason = (factors: any, itemContent: string): string => {
  if (factors.ingredientMatch > 0) {
    return 'Contains ingredients you enjoy';
  }
  if (factors.preparationMatch > 10) {
    return 'Healthy preparation method';
  }
  return 'Matches several of your preferences';
};

const determineNeutralMatchReason = (factors: any, itemContent: string): string => {
  // Check for specific preparation methods
  if (itemContent.includes('fresh')) {
    return 'Made with fresh ingredients 🌱';
  }
  if (itemContent.includes('house') || itemContent.includes('homemade')) {
    return 'House specialty dish 👨‍🍳';
  }
  if (itemContent.includes('seasonal')) {
    return 'Seasonal specialty 🍂';
  }
  if (itemContent.includes('signature')) {
    return "Chef's signature dish 🎨";
  }
  if (itemContent.includes('popular') || itemContent.includes('favorite')) {
    return 'Popular with diners 🌟';
  }
  
  // Check dish types for more specific messaging
  if (itemContent.includes('salad')) {
    return 'Fresh and light option 🥗';
  }
  if (itemContent.includes('soup')) {
    return 'Comforting house soup 🥣';
  }
  if (itemContent.includes('grill')) {
    return 'Fresh off the grill 🔥';
  }
  if (itemContent.includes('spicy')) {
    return 'Flavorful spicy dish 🌶️';
  }

  // More engaging default messages
  const defaultMessages = [
    'Worth exploring 🍽️',
    'Traditional favorite 🏆',
    'Classic dish 👌',
    'Local specialty 🏠',
    'Chef recommended 👨‍🍳'
  ];

  return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
};