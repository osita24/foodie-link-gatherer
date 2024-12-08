import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Crown, Star, Sparkles, ThumbsUp, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchDetailsBadgeProps {
  matchDetails: {
    score: number;
    matchType?: 'perfect' | 'good' | 'neutral' | 'warning' | 'avoid';
    reason?: string;
    warning?: string;
    highlights?: string[];
    considerations?: string[];
    rank?: number;
    rankDescription?: string;
  };
}

export const MatchDetailsBadge = ({ matchDetails }: MatchDetailsBadgeProps) => {
  const getScoreColor = (matchType: string = 'neutral') => {
    switch (matchType) {
      case 'perfect':
        return "text-emerald-700 bg-emerald-100";
      case 'good':
        return "text-blue-700 bg-blue-100";
      case 'warning':
        return "text-yellow-700 bg-yellow-100";
      case 'avoid':
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getMatchIcon = (matchType: string = 'neutral', rank?: number) => {
    if (rank && rank <= 3) {
      return rank === 1 ? <Crown className="w-3 h-3 ml-1" /> : <Star className="w-3 h-3 ml-1" />;
    }
    switch (matchType) {
      case 'perfect':
        return <Sparkles className="w-3 h-3 ml-1" />;
      case 'good':
        return <ThumbsUp className="w-3 h-3 ml-1" />;
      case 'warning':
      case 'avoid':
        return <AlertTriangle className="w-3 h-3 ml-1" />;
      default:
        return <Info className="w-3 h-3 ml-1" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={cn(
              "animate-fade-in-up cursor-help transition-colors",
              getScoreColor(matchDetails.matchType)
            )}
          >
            {matchDetails.rankDescription || "Try something new"}
            {getMatchIcon(matchDetails.matchType, matchDetails.rank)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {matchDetails.highlights?.map((highlight, index) => (
              <span key={index} className="block">• {highlight}</span>
            ))}
            {matchDetails.considerations?.map((consideration, index) => (
              <span key={index} className="block text-red-600">• {consideration}</span>
            ))}
            {!matchDetails.highlights && !matchDetails.considerations && 
              "Try something new! This dish might surprise you."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};