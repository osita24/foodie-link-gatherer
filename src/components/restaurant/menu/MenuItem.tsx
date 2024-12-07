import { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  // Clean up the name by removing markdown and numbers
  const cleanName = item.name
    .replace(/^\d+\.\s*/, '') // Remove leading numbers
    .replace(/\*\*/g, '') // Remove markdown
    .split(' - ')[0]; // Get the name part

  // Get the description part after the dash, if it exists
  const description = item.name.includes(' - ') 
    ? item.name.split(' - ')[1].replace(/\*\*/g, '').trim()
    : item.description;

  const isLongDescription = description && description.length > 100;
  const displayDescription = isExpanded ? description : description?.substring(0, 100);

  return (
    <div className="group relative p-3 rounded-lg hover:bg-accent/30 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-secondary group-hover:text-primary transition-colors">
              {cleanName}
            </h3>
            {recommendationScore >= 90 && (
              <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">
                <Star className="w-3 h-3 mr-1 inline-block fill-current" />
                Top Pick
              </Badge>
            )}
          </div>
          {description && (
            <div className="mt-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {displayDescription}
                {isLongDescription && !isExpanded && "..."}
              </p>
              {isLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Show less
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Show more
                      <ChevronDown className="w-3 h-3" />
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
        {recommendationScore > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItem;