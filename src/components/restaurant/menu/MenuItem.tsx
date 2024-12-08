import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
            {matchDetails.score >= 85 && (
              <Badge 
                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0
                  animate-fade-in-up"
              >
                Perfect Match! 🎯
              </Badge>
            )}
            {matchDetails.score <= 40 && (
              <Badge 
                className="bg-red-100 text-red-700 hover:bg-red-200 border-0
                  animate-fade-in-up"
              >
                Heads Up! ⚠️
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
          
          {(matchDetails.reason || matchDetails.warning) && (
            <div className="flex items-center gap-2 flex-wrap animate-fade-in-up">
              {matchDetails.score >= 85 && matchDetails.reason && (
                <p className="text-sm text-emerald-700 font-medium">
                  {matchDetails.reason} ✨
                </p>
              )}
              {matchDetails.score <= 40 && matchDetails.warning && (
                <p className="text-sm text-red-700 font-medium">
                  {matchDetails.warning} ⚠️
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