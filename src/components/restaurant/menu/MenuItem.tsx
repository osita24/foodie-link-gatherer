import { useState } from "react";
import { Star, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description?: string;
    category?: string;
  };
  recommendationScore: number;
}

const MenuItem = ({ item, recommendationScore }: MenuItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState(null);

  // Listen for auth state changes
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  // Clean up the name by removing markdown and numbers
  const cleanName = item.name
    .replace(/^\d+\.\s*/, '')
    .replace(/\*\*/g, '')
    .split(' - ')[0];

  const description = item.name.includes(' - ') 
    ? item.name.split(' - ')[1].replace(/\*\*/g, '').trim()
    : item.description;

  const isLongDescription = description && description.length > 100;
  const displayDescription = isExpanded ? description : description?.substring(0, 100);

  const getPersonalizedRecommendation = (score: number) => {
    if (score >= 90) {
      return {
        className: "bg-success/5 hover:bg-success/10",
        badge: "Perfect for You!",
        badgeClass: "bg-success/10 text-success border-success/20",
        reason: "Based on your preferences, this dish is an excellent match! It aligns with your dietary needs and favorite ingredients."
      };
    }
    if (score >= 75) {
      return {
        className: "bg-primary/5 hover:bg-primary/10",
        badge: "Recommended",
        badgeClass: "bg-primary/10 text-primary border-primary/20",
        reason: "This dish includes ingredients and preparation methods you typically enjoy."
      };
    }
    return {
      className: "hover:bg-accent/5",
      badge: "Consider This",
      badgeClass: "bg-muted/10 text-muted-foreground border-muted/20",
      reason: "While this may not be your usual choice, it could be worth trying something new!"
    };
  };

  const recommendation = getPersonalizedRecommendation(recommendationScore);

  return (
    <div className={cn(
      "group relative p-4 rounded-lg transition-all duration-300",
      recommendation.className
    )}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-medium text-secondary">
            {cleanName}
          </h3>
          {session ? (
            <Badge variant="outline" className={cn("text-xs", recommendation.badgeClass)}>
              {recommendation.badge}
            </Badge>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 hover:bg-primary/10"
              onClick={() => setShowAuthModal(true)}
            >
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <span>View match</span>
              <Lock className="w-3 h-3 text-primary/70" />
            </Button>
          )}
        </div>
        
        {description && (
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
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
        
        {session && (
          <div className="text-sm text-muted-foreground">
            <p className="leading-relaxed">
              {recommendation.reason}
            </p>
          </div>
        )}
      </div>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default MenuItem;