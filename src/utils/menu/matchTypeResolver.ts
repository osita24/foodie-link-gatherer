interface MatchResult {
  matchType: 'perfect' | 'good' | 'neutral' | 'warning';
  reason?: string;
  warning?: string;
}

export const resolveMatchType = (
  score: number,
  factors: any,
  itemContent: string
): MatchResult => {
  console.log("🎯 Resolving match type for item:", itemContent);
  console.log("📊 Score and factors:", { score, factors });

  // Complete rejection for scores of 0
  if (score === 0) {
    return {
      matchType: 'warning',
      warning: 'This item does not match your dietary preferences'
    };
  }

  // Perfect matches (90-100)
  if (score >= 90) {
    return {
      matchType: 'perfect',
      reason: 'Perfect match for your preferences'
    };
  }

  // Good matches (75-89)
  if (score >= 75) {
    return {
      matchType: 'good',
      reason: 'Great choice that aligns with your preferences'
    };
  }

  // Neutral matches (50-74)
  if (score >= 50) {
    return {
      matchType: 'neutral'
    };
  }

  // Warning for low scores
  return {
    matchType: 'warning',
    warning: 'This item may not match your preferences well'
  };
};