import { useState } from "react";
import { Star, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";

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

  const getMatchColor = (score: number) => {
    if (score >= 90) return "bg-success/10 text-success border-success/20";
    if (score >= 75) return "bg-primary/10 text-primary border-primary/20";
    if (score >= 60) return "bg-warning/10 text-warning border-warning/20";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getMatchDescription = (score: number) => {
    if (score >= 90) return "Perfect match! Aligns with your preferences";
    if (score >= 75) return "Great match based on your taste profile";
    if (score >= 60) return "Good match with some of your preferences";
    return "Moderate match with your preferences";
  };

  return (
    <div className="group relative p-4 rounded-lg hover:bg-accent/20 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-medium text-secondary group-hover:text-primary transition-colors">
              {cleanName}
            </h3>
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
          
          <div className="flex items-center gap-3 flex-wrap">
            {item.category && (
              <Badge 
                variant="outline" 
                className="text-xs bg-transparent border-primary/20 text-primary/70"
              >
                {item.category}
              </Badge>
            )}
            {!session ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs gap-1.5 hover:bg-primary/10 group/match relative overflow-hidden
                  border border-primary/20 rounded-full transition-all duration-300"
                onClick={() => setShowAuthModal(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/10 opacity-0 group-hover/match:opacity-100 transition-opacity" />
                <Star className="w-3.5 h-3.5 text-yellow-400" strokeWidth={2} />
                <span className="relative z-10 font-medium">Check if it's a match</span>
                <Lock className="w-3 h-3 text-primary/70" strokeWidth={2} />
              </Button>
            ) : (
              <div className={`flex flex-col gap-1 w-full sm:w-auto ${getMatchColor(recommendationScore)} 
                rounded-lg p-3 border animate-fade-up transition-all duration-300`}>
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-sm font-medium">
                    {recommendationScore}% Match
                  </span>
                </div>
                <p className="text-xs opacity-90">
                  {getMatchDescription(recommendationScore)}
                </p>
              </div>
            )}
          </div>
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