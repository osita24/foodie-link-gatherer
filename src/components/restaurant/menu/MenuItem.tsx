import { useState } from "react";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
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
  matchReason?: string;
  avoidReason?: string;
}

const MenuItem = ({ item, recommendationScore, matchReason, avoidReason }: MenuItemProps) => {
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
    if (score >= 90) return "border-l-4 border-emerald-400 bg-emerald-50/50";
    if (score <= 30) return "border-l-4 border-red-400 bg-red-50/50";
    return "";
  };

  const getRecommendationBadge = (score: number) => {
    if (score >= 90) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">
          Perfect Match! 🎯
        </Badge>
      );
    }
    if (score <= 30) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">
          Heads Up! ⚠️
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      "group relative p-4 rounded-lg transition-all duration-300",
      getMatchStyle(recommendationScore)
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="text-base font-medium text-gray-900">
              {cleanName}
            </h3>
            {session && getRecommendationBadge(recommendationScore)}
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
          
          <div className="flex items-center gap-2 flex-wrap">
            {item.category && (
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
            )}
            
            {!session ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs gap-1.5"
                onClick={() => setShowAuthModal(true)}
              >
                View match details
                <Lock className="w-3 h-3" />
              </Button>
            ) : (
              recommendationScore >= 90 && matchReason && (
                <p className="text-sm text-emerald-700">
                  {matchReason} ✨
                </p>
              )
            )}
            
            {session && recommendationScore <= 30 && avoidReason && (
              <p className="text-sm text-red-700">
                {avoidReason} ⚠️
              </p>
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