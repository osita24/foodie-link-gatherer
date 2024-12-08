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

  return {
    matchType: 'neutral',
    reason: 'Standard menu option'
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