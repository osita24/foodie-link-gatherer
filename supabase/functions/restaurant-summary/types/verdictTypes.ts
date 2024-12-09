export type Verdict = "MUST VISIT" | "WORTH A TRY" | "SKIP IT";

export interface VerdictReason {
  emoji: string;
  text: string;
  priority?: number;
}

export interface VerdictResult {
  verdict: Verdict;
  reasons: VerdictReason[];
}

export interface MatchScores {
  dietaryScore: number;
  cuisineScore: number;
  proteinScore: number;
  atmosphereScore: number;
  priceScore: number;
}