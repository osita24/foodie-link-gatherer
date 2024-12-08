import { useState } from "react";
import { ChevronDown, ChevronUp, ThumbsUp, AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    price?: string;
  };
  matchDetails: {
    score: number;
    reason?: string;
    warning?: string;
    matchType?: 'perfect' | 'good' | 'neutral' | 'warning';
    isTopMatch?: boolean;
  } | null;
}

const MenuItem = ({ item, matchDetails }: MenuItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanName = item.name
    .replace(/^\d+\.\s*/, '')
    .replace(/\*\*/g, '')
    .split(' - ')[0];

  const description = item.name.includes(' - ') 
    ? item.name.split(' - ')[1].replace(/\*\*/g, '').trim()
    : item.description;

  const isLongDescription = description && description.length > 100;
  const displayDescription = isExpanded ? description : description?.substring(0, 100);

  const getMatchStyle = (matchType: string = 'neutral', isTopMatch: boolean = false) => {
    if (isTopMatch) {
      return "border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent";
    }
    switch (matchType) {
      case 'perfect':
        return "border-l-4 border-emerald-400 bg-gradient-to-r from-emerald-50/50 to-transparent";
      case 'good':
        return "border-l-4 border-blue-400 bg-gradient-to-r from-blue-50/50 to-transparent";
      case 'warning':
        return "border-l-4 border-red-400 bg-gradient-to-r from-red-50/50 to-transparent";
      default:
        return "border-l-4 border-gray-200 hover:bg-gray-50/50";
    }
  };

  const getScoreColor = (matchType: string = 'neutral', isTopMatch: boolean = false) => {
    if (isTopMatch) {
      return "text-primary bg-primary/10";
    }
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

  return (
    <div 
      className={cn(
        "group relative p-4 rounded-lg transition-all duration-300",
        "hover:shadow-md animate-fade-up",
        getMatchStyle(matchDetails?.matchType, matchDetails?.isTopMatch)
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="text-base font-medium text-gray-900">
              {cleanName}
            </h3>
            
            {matchDetails?.isTopMatch && (
              <Badge 
                className="animate-fade-up bg-primary/10 text-primary hover:bg-primary/20"
              >
                TOP MATCH
                <Sparkles className="w-3 h-3 ml-1" />
              </Badge>
            )}
            
            {matchDetails && !matchDetails.isTopMatch && matchDetails.score > 70 && (
              <Badge 
                className={cn(
                  "animate-fade-up",
                  getScoreColor(matchDetails.matchType)
                )}
              >
                {matchDetails.score}% Match
                <ThumbsUp className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
          
          {description && (
            <div className="mt-1">
              <p className="text-sm text-gray-500 leading-relaxed">
                {displayDescription}
                {isLongDescription && !isExpanded && "..."}
              </p>
              {isLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Show more <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>
          )}
          
          {matchDetails?.reason && !matchDetails.warning && (
            <div className="flex items-center gap-2 animate-fade-up">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                {matchDetails.reason}
              </Badge>
            </div>
          )}
          
          {matchDetails?.warning && (
            <div className="flex items-center gap-2 animate-fade-up">
              <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                {matchDetails.warning} <AlertTriangle className="w-3 h-3 ml-1" />
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;