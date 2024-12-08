import { Card, CardContent } from "@/components/ui/card";
import { Star, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";
import { Progress } from "@/components/ui/progress";

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
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-secondary">
                  See Your Match Score
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Find out how well this matches your taste
                </p>
              </div>
              <Button 
                onClick={() => setShowAuthModal(true)}
                size="sm"
                className="bg-primary hover:bg-primary/90"
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
    <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10 border-accent/20">
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : insights ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {insights.matchScore}%
                  </span>
                  <span className="text-sm text-muted-foreground">match</span>
                </div>
                <Progress value={insights.matchScore} className="h-2 mt-2" />
              </div>
            </div>
            
            <div className="grid gap-2">
              {insights.reasons.map((reason, index) => (
                <div 
                  key={index}
                  className="bg-white/50 p-3 rounded-lg flex items-center gap-3 animate-fade-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <p className="text-sm text-muted-foreground">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MatchScoreCard;