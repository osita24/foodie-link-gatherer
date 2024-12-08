import { Card, CardContent } from "@/components/ui/card";
import { Star, Loader2, Sparkles, Check } from "lucide-react";
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
        <Card className="bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 border-accent/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="relative">
                <Sparkles className="h-12 w-12 mx-auto text-primary animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent blur-sm" />
              </div>
              <h3 className="text-2xl font-semibold text-primary">
                Discover Your Perfect Match
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                See how well this restaurant matches your taste preferences with our AI-powered compatibility score!
              </p>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-2 rounded-full animate-fade-up"
              >
                Sign in to View Match
              </Button>
            </div>
          </CardContent>
        </Card>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 border-accent/20 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : insights ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="relative">
                <Star className="h-16 w-16 text-yellow-400 fill-yellow-400 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent blur-sm" />
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-primary mb-1">
                  {insights.matchScore}% Match
                </h3>
                <p className="text-sm text-gray-600">with your preferences</p>
              </div>
            </div>
            
            <div className="space-y-3 max-w-md mx-auto">
              {insights.reasons.map((reason, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white/50 rounded-lg shadow-sm animate-fade-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Unable to generate insights</p>
            <p className="text-sm text-gray-500 mt-1">Please try again later</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchScoreCard;