import { useState } from "react";
import { ChevronDown, ChevronUp, ThumbsUp, AlertTriangle, Sparkles, ArrowRight, Info, Crown, Star } from "lucide-react";
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
    matchType?: 'perfect' | 'good' | 'neutral' | 'warning' | 'avoid';
    reason?: string;
    warning?: string;
    highlights?: string[];
    considerations?: string[];
    rank?: number;
    rankDescription?: string;
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

  const getMatchStyle = (matchType: string = 'neutral') => {
    switch (matchType) {
      case 'perfect':
        return "border-l-4 border-emerald-400 bg-gradient-to-r from-emerald-50 to-transparent";
      case 'good':
        return "border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-transparent";
      case 'warning':
        return "border-l-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-transparent";
      case 'avoid':
        return "border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-transparent";
      default:
        return "hover:bg-gray-50/50";
    }
  };

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
        return <AlertTriangle className="w-3 h-3 ml-1" />;
      case 'avoid':
        return <AlertTriangle className="w-3 h-3 ml-1" />;
      default:
        return <Info className="w-3 h-3 ml-1" />;
    }
  };

  const getRankBadge = (rank?: number) => {
    if (!rank || rank > 3) return null;
    
    const badges = {
      1: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
      2: "bg-gradient-to-r from-slate-400 to-slate-600 text-white",
      3: "bg-gradient-to-r from-amber-600 to-amber-800 text-white"
    };

    return (
      <Badge className={cn("absolute -top-2 -right-2", badges[rank as keyof typeof badges])}>
        #{rank}
      </Badge>
    );
  };

  return (
    <div 
      className={cn(
        "group relative p-4 rounded-lg transition-all duration-300",
        "hover:shadow-md",
        getMatchStyle(matchDetails.matchType)
      )}
    >
      {getRankBadge(matchDetails.rank)}
      
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
          
          {(matchDetails.highlights?.length || matchDetails.considerations?.length) && (
            <div className="flex items-center gap-2 flex-wrap animate-fade-in-up">
              {matchDetails.highlights?.map((highlight, index) => (
                <span key={index} className="text-sm text-emerald-700 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {highlight}
                </span>
              ))}
              {matchDetails.considerations?.map((consideration, index) => (
                <span key={index} className="text-sm text-red-700 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {consideration}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;