export interface SummaryResponse {
  verdict: "PERFECT MATCH" | "WORTH EXPLORING" | "CONSIDER ALTERNATIVES";
  reasons: Array<{
    emoji: string;
    text: string;
  }>;
}