import { useState } from "react";
import { ChevronDown, ChevronUp, ThumbsUp, AlertTriangle, Star } from "lucide-react";
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
    matchType?: 'perfect' | 'good' | 'neutral' | 'warning';
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

  const getMatchStyle = (matchType: string = 'neutral') => {
    if (!matchDetails) return "hover:bg-gray-50/50";
    
    switch (matchType) {
      case 'perfect':
        return "border-l-4 border-emerald-400 bg-gradient-to-r from-emerald-50 to-transparent";
      case 'good':
        return "border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-transparent";
      case 'warning':
        return "border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-transparent";
      default:
        return "hover:bg-gray-50/50";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-700 bg-emerald-100";
    if (score >= 70) return "text-blue-700 bg-blue-100";
    if (score < 50) return "text-red-700 bg-red-100";
    return "text-gray-700 bg-gray-100";
  };

  const getMatchLabel = (score: number) => {
    if (score >= 85) return "STRONG MATCH";
    if (score >= 70) return "GOOD MATCH";
    if (score < 50) return "MAY NOT MATCH";
    return "NEUTRAL MATCH";
  };

  const getMatchIcon = (matchType: string = 'neutral') => {
    switch (matchType) {
      case 'perfect':
        return <Star className="w-3 h-3 ml-1" />;
      case 'good':
        return <ThumbsUp className="w-3 h-3 ml-1" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 ml-1" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "group relative p-4 rounded-lg transition-all duration-300",
        "hover:shadow-md",
        getMatchStyle(matchDetails?.matchType)
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="text-base font-medium text-gray-900">
              {cleanName}
            </h3>
            
            {matchDetails && (
              <div className="flex flex-col items-end gap-1 min-w-[100px]">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-2xl font-bold">
                      {matchDetails.score}%
                    </div>
                  </div>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      className="text-gray-200"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="32"
                      cy="32"
                    />
                    <circle
                      className={cn(
                        "transition-all duration-300",
                        matchDetails.score >= 85 ? "text-emerald-400" :
                        matchDetails.score >= 70 ? "text-blue-400" :
                        matchDetails.score < 50 ? "text-red-400" :
                        "text-gray-400"
                      )}
                      strokeWidth="4"
                      strokeDasharray={188.5}
                      strokeDashoffset={188.5 - (matchDetails.score / 100) * 188.5}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="32"
                      cy="32"
                    />
                  </svg>
                </div>
                <Badge 
                  className={cn(
                    "animate-fade-in-up cursor-help transition-colors whitespace-nowrap",
                    getScoreColor(matchDetails.score)
                  )}
                >
                  {getMatchLabel(matchDetails.score)}
                  {getMatchIcon(matchDetails.matchType)}
                </Badge>
              </div>
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
          
          {matchDetails && (matchDetails.reason || matchDetails.warning) && (
            <div className="flex items-center gap-2 flex-wrap animate-fade-in-up">
              {matchDetails.matchType !== 'warning' && matchDetails.reason && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help border-emerald-200 bg-emerald-50 text-emerald-700">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {matchDetails.reason}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Why this matches your preferences</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {matchDetails.matchType === 'warning' && matchDetails.warning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help border-red-200 bg-red-50 text-red-700">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {matchDetails.warning}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Potential concerns based on your preferences</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;