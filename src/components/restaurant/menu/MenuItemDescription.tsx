import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MenuItemDescriptionProps {
  description: string;
}

export const MenuItemDescription = ({ description }: MenuItemDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Reduced character limit from 100 to 75 for better readability
  const CHARACTER_LIMIT = 75;
  const isLongDescription = description && description.length > CHARACTER_LIMIT;
  const displayDescription = isExpanded ? description : description?.substring(0, CHARACTER_LIMIT);

  if (!description) return null;

  return (
    <div className="mt-1">
      <p className="text-sm text-gray-500 leading-relaxed">
        {displayDescription}
        {isLongDescription && !isExpanded && "..."}
      </p>
      {isLongDescription && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          aria-label={isExpanded ? "Show less text" : "Show more text"}
        >
          {isExpanded ? (
            <>Show less <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Show more <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      )}
    </div>
  );
};