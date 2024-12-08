import { useState } from "react";
import { ChevronDown, ChevronUp, ThumbsUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description?: string;
    category?: string;
  };
  matchDetails: {
    score: number;
    reason?: string;
    warning?: string;
  };
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

  const getMatchStyle = (score: number) => {
    if (score >= 85) return "border-l-4 border-emerald-400 bg-gradient-to-r from-emerald-50 to-transparent";
    if (score <= 40) return "border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-transparent";
    return "hover:bg-gray-50/50";
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-700 bg-emerald-50";
    if (score <= 40) return "text-red-700 bg-red-50";
    return "text-orange-700 bg-orange-50";
  };

  return (
    <div 
      className={cn(
        "group relative p-4 rounded-lg transition-all duration-300",
        "hover:shadow-md",
        getMatchStyle(matchDetails.score)
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="text-base font-medium text-gray-900">
              {cleanName}
            </h3>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    className={cn(
                      "cursor-help transition-colors",
                      getScoreColor(matchDetails.score)
                    )}
                  >
                    {matchDetails.score >= 85 && <ThumbsUp className="w-3 h-3 mr-1" />}
                    {matchDetails.score <= 40 && <AlertTriangle className="w-3 h-3 mr-1" />}
                    Match Score: {matchDetails.score}%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {matchDetails.score >= 85 && "Perfect match based on your preferences! 🎯"}
                    {matchDetails.score <= 40 && "May not align with your preferences ⚠️"}
                    {matchDetails.score > 40 && matchDetails.score < 85 && "Moderate match with your preferences"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
          
          {(matchDetails.reason || matchDetails.warning) && (
            <div className="flex items-center gap-2 flex-wrap animate-fade-in-up">
              {matchDetails.score >= 85 && matchDetails.reason && (
                <p className="text-sm text-emerald-700 font-medium flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  {matchDetails.reason}
                </p>
              )}
              {matchDetails.score <= 40 && matchDetails.warning && (
                <p className="text-sm text-red-700 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {matchDetails.warning}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;