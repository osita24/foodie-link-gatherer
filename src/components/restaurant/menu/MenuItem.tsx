import { useState } from "react";
import { Star, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";

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
  const [showAuthModal, setShowAuthModal] = useState(false);

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
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs gap-1 hover:bg-primary/10"
              onClick={() => setShowAuthModal(true)}
            >
              <Lock className="w-3 h-3" />
              View Match
            </Button>
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
      </div>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default MenuItem;