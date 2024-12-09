import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MenuItemDescriptionProps {
  description: string;
}

export const MenuItemDescription = ({ description }: MenuItemDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDescription = description && description.length > 100;
  const displayDescription = isExpanded ? description : description?.substring(0, 100);

  return (
    <div className="w-full">
      <p className="text-sm text-gray-500 leading-relaxed break-words">
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
  );
};