import { useState } from "react";
import { Star, Lock, Sparkles, ThumbsUp } from "lucide-react";
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState(null);

  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  const cleanName = item.name
    .replace(/^\d+\.\s*/, '')
    .replace(/\*\*/g, '')
    .split(' - ')[0];

  const description = item.name.includes(' - ') 
    ? item.name.split(' - ')[1].replace(/\*\*/g, '').trim()
    : item.description;

  const getRecommendationStyle = (score: number) => {
    if (score >= 90) {
      return {
        container: "bg-success/10 hover:bg-success/20 border-l-4 border-l-success",
        badge: "Perfect Match! ✨",
        icon: <Sparkles className="w-4 h-4 text-success" />,
        message: "Based on your love for spicy food and Thai cuisine!"
      };
    }
    if (score >= 75) {
      return {
        container: "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary",
        badge: "Great Choice 👌",
        icon: <ThumbsUp className="w-4 h-4 text-primary" />,
        message: "Matches your dietary preferences"
      };
    }
    return {
      container: "hover:bg-accent/5",
      badge: null,
      icon: null,
      message: null
    };
  };

  const recommendation = getRecommendationStyle(recommendationScore);

  return (
    <div className={cn(
      "group relative p-4 rounded-lg transition-all duration-300",
      recommendation.container
    )}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-medium text-secondary">
            {cleanName}
          </h3>
          
          {session ? (
            recommendation.badge && (
              <div className="flex items-center gap-1.5">
                {recommendation.icon}
                <span className="text-sm font-medium text-primary">
                  {recommendation.badge}
                </span>
              </div>
            )
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 hover:bg-primary/10"
              onClick={() => setShowAuthModal(true)}
            >
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <Lock className="w-3 h-3 text-primary/70" />
            </Button>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        
        {session && recommendation.message && (
          <p className="text-sm font-medium text-primary">
            {recommendation.message}
          </p>
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