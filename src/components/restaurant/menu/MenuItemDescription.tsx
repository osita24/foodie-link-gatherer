import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MenuItemDescriptionProps {
  description: string;
}

const MenuItemDescription = ({ description }: MenuItemDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > 100;

  const truncatedText = shouldTruncate && !isExpanded
    ? `${description.slice(0, 100)}...`
    : description;

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm leading-relaxed break-words">
        {truncatedText}
      </p>
      
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          {isExpanded ? "Show less" : "Read more"}
        </Button>
      )}
    </div>
  );
};

export default MenuItemDescription;