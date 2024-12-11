import { SummaryResponse } from "../types/summary";

interface VerdictDisplayProps {
  verdict: SummaryResponse["verdict"];
  reasons: SummaryResponse["reasons"];
}

const getVerdictStyles = (verdict: string) => {
  switch (verdict) {
    case "PERFECT MATCH":
      return "bg-success/10 text-success border-success/20 shadow-[0_0_15px_rgba(104,160,99,0.15)]";
    case "WORTH EXPLORING":
      return "bg-warning/10 text-warning border-warning/20 shadow-[0_0_15px_rgba(197,165,114,0.15)]";
    case "CONSIDER ALTERNATIVES":
      return "bg-muted/10 text-muted-foreground border-muted/20 shadow-[0_0_15px_rgba(120,120,120,0.15)]";
    default:
      return "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(74,103,65,0.15)]";
  }
};

export const VerdictDisplay = ({ verdict, reasons }: VerdictDisplayProps) => {
  return (
    <div className="space-y-6">
      <div 
        className={`inline-block px-4 py-2 rounded-full border ${getVerdictStyles(verdict)} 
          font-semibold text-lg md:text-xl animate-fade-up transition-all duration-300 hover:scale-105`}
      >
        {verdict}
      </div>
      
      <div className="space-y-4">
        {reasons.map((reason, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 animate-fade-up"
            style={{ animationDelay: `${(index + 1) * 150}ms` }}
          >
            <span className="text-2xl">{reason.emoji}</span>
            <p className="text-muted-foreground leading-tight pt-1">
              {reason.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};