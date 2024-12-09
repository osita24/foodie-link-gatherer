import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, Sparkles, ThumbsUp, AlertTriangle, ArrowRight } from "lucide-react";

interface MenuItemMatchBadgeProps {
  score: number;
  matchType?: 'perfect' | 'good' | 'neutral' | 'warning';
  isTopMatch?: boolean;
}

export const MenuItemMatchBadge = ({ score, matchType = 'neutral', isTopMatch }: MenuItemMatchBadgeProps) => {
  const getScoreColor = (matchType: string = 'neutral') => {
    switch (matchType) {
      case 'perfect':
        return "text-emerald-700 bg-emerald-100";
      case 'good':
        return "text-blue-700 bg-blue-100";
      case 'warning':
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getMatchIcon = () => {
    if (isTopMatch) return <Crown className="w-3 h-3 ml-1 text-primary animate-bounce" />;
    switch (matchType) {
      case 'perfect':
        return <Sparkles className="w-3 h-3 ml-1" />;
      case 'good':
        return <ThumbsUp className="w-3 h-3 ml-1" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 ml-1" />;
      default:
        return <ArrowRight className="w-3 h-3 ml-1" />;
    }
  };

  return (
    <Badge 
      className={cn(
        "animate-fade-in-up cursor-help transition-colors",
        getScoreColor(matchType)
      )}
    >
      {score}% Match {getMatchIcon()}
    </Badge>
  );
};