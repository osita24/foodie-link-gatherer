import { Card, CardContent } from "@/components/ui/card";
import { Star, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";

interface MatchScoreCardProps {
  restaurant: any;
}

const MatchScoreCard = ({ restaurant }: MatchScoreCardProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [insights, setInsights] = useState<{ matchScore: number; reasons: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("🎯 MatchScoreCard mounted with restaurant:", restaurant?.name);
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🔐 Auth session in MatchScoreCard:", session?.user?.id);
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 Auth state changed in MatchScoreCard:", session?.user?.id);
      setSession(session);
      if (session) setShowAuthModal(false);
    });
  }, []);

  useEffect(() => {
    const loadFakeInsights = async () => {
      if (!session?.user || !restaurant) return;
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setInsights({
          matchScore: 85,
          reasons: [
            "Perfect match for your taste preferences",
            "Matches your dietary preferences",
            "Atmosphere you'll love"
          ]
        });
      } catch (error) {
        console.error("❌ Error loading insights:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session && restaurant) loadFakeInsights();
  }, [session, restaurant]);

  if (!session) {
    return (
      <>
        <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-accent/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-secondary">
                  See Your Match Score
                </h3>
                <p className="text-sm text-muted-foreground">
                  Find your perfect menu matches
                </p>
              </div>
              <Button 
                onClick={() => setShowAuthModal(true)}
                size="sm"
                variant="outline"
                className="bg-background hover:bg-accent/50"
              >
                Sign in
              </Button>
            </div>
          </CardContent>
        </Card>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-accent/20 overflow-hidden">
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : insights ? (
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="bg-primary/10 p-2.5 rounded-full">
                <Star className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-primary">
                  {insights.matchScore}%
                </span>
                <span className="text-sm text-muted-foreground">match</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {insights.reasons.map((reason, index) => (
                  <p 
                    key={index}
                    className="text-sm text-muted-foreground flex items-center gap-1.5 truncate"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                    {reason}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MatchScoreCard;