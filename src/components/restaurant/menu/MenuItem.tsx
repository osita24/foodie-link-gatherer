import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    category?: string;
  };
  recommendationScore: number;
}

const MenuItem = ({ item, recommendationScore }: MenuItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract name from description if it contains a dash
  const hasDetailedDescription = item.description?.includes(" - ");
  const displayName = hasDetailedDescription 
    ? item.description.split(" - ")[0]
    : item.name;
  const displayDescription = hasDetailedDescription
    ? item.description.split(" - ")[1]
    : item.description;

  const hasLongDescription = displayDescription && displayDescription.length > 100;

  return (
    <div className="group relative p-3 rounded-lg hover:bg-accent/30 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-secondary group-hover:text-primary transition-colors">
              {displayName}
            </h3>
            {recommendationScore >= 90 && (
              <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">
                <Star className="w-3 h-3 mr-1 inline-block fill-current" />
                Top Pick
              </Badge>
            )}
          </div>
          
          {displayDescription && (
            <div className="relative">
              <p className={cn(
                "mt-1 text-sm text-muted-foreground leading-snug",
                !isExpanded && hasLongDescription && "line-clamp-2"
              )}>
                {displayDescription}
              </p>
              
              {hasLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-xs text-primary flex items-center hover:text-primary/70 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Read more
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          
          {item.category && (
            <Badge 
              variant="outline" 
              className="mt-1.5 text-xs bg-transparent border-primary/20 text-primary/70"
            >
              {item.category}
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {item.price && item.price > 0 && (
            <span className="text-base font-medium text-primary whitespace-nowrap">
              ${item.price.toFixed(2)}
            </span>
          )}
          {recommendationScore > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    recommendationScore >= 90 ? "bg-green-500" :
                    recommendationScore >= 80 ? "bg-primary" :
                    "bg-primary/60"
                  )}
                  style={{ width: `${recommendationScore}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {recommendationScore}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;