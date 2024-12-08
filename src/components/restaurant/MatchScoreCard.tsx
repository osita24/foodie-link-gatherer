import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    // Simulating loading insights with fake data for now
    const loadFakeInsights = async () => {
      if (!session?.user || !restaurant) {
        console.log("❌ Cannot load insights - missing user or restaurant data");
        return;
      }

      try {
        setIsLoading(true);
        console.log("🔍 Loading fake insights for restaurant:", restaurant.name);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fake insights data
        const fakeInsights = {
          matchScore: 85,
          reasons: [
            "Matches your preferred cuisine style",
            "Offers several dishes with your favorite proteins",
            "Atmosphere aligns with your dining preferences"
          ]
        };

        console.log("✨ Setting fake insights:", fakeInsights);
        setInsights(fakeInsights);
      } catch (error) {
        console.error("❌ Error loading insights:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session && restaurant) {
      console.log("🔄 Loading insights for restaurant:", restaurant.name);
      loadFakeInsights();
    }
  }, [session, restaurant]);

  if (!session) {
    return (
      <>
        <Card className="bg-white/95 backdrop-blur border-accent/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Sparkles className="h-8 w-8 mx-auto text-primary animate-pulse" />
              <h3 className="text-xl font-semibold text-primary">
                Get Your Personalized Match Score
              </h3>
              <p className="text-sm text-gray-600">
                Find out if this restaurant matches your taste preferences!
              </p>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Sign in to View
              </Button>
            </div>
          </CardContent>
        </Card>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur border-accent/20 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="border-b border-accent/10 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 fill-current" />
          Your Restaurant Match
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : insights ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-primary animate-fade-in">
                {insights.matchScore}%
              </span>
              <span className="text-sm text-gray-600">match</span>
            </div>
            <div className="space-y-2">
              {insights.reasons.map((reason, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600 animate-fade-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <p>{reason}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-600">
            <p>Unable to generate insights</p>
            <p className="text-xs text-gray-500 mt-1">Please try again later</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchScoreCard;