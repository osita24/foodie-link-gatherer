import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";
import { generateRestaurantInsights } from "@/utils/restaurantInsights";
import { mapSupabaseToUserPreferences } from "@/utils/preferencesMapper";

interface MatchScoreCardProps {
  restaurant: any;
}

const MatchScoreCard = ({ restaurant }: MatchScoreCardProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState(null);
  const [insights, setInsights] = useState<{ matchScore: number; reasons: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("🔍 Initializing MatchScoreCard with restaurant:", restaurant);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuthModal(false);
    });
  }, []);

  useEffect(() => {
    const loadInsights = async () => {
      if (!session?.user || !restaurant) return;

      try {
        setIsLoading(true);
        console.log("🔍 Loading user preferences...");
        
        const { data: preferencesData } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (!preferencesData) {
          console.log("❌ No preferences found");
          return;
        }

        const preferences = mapSupabaseToUserPreferences(preferencesData);
        console.log("✅ User preferences loaded:", preferences);

        const generatedInsights = await generateRestaurantInsights(restaurant, preferences);
        console.log("✨ Setting insights:", generatedInsights);
        setInsights(generatedInsights);
      } catch (error) {
        console.error("❌ Error loading insights:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInsights();
  }, [session, restaurant]);

  if (!session) {
    return (
      <>
        <Card className="bg-white/95 backdrop-blur border-accent/20 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Sparkles className="h-8 w-8 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-primary">
                See Your Match Score
              </h3>
              <p className="text-sm text-gray-600">
                Find out if this restaurant matches your taste!
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
    <>
      <Card className="bg-white/95 backdrop-blur border-accent/20 hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="border-b border-accent/10 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            Match Score
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
                <span className="text-4xl font-bold text-primary">
                  {insights.matchScore}%
                </span>
                <span className="text-sm text-gray-600">match</span>
              </div>
              <div className="space-y-2">
                {insights.reasons.slice(0, 3).map((reason, index) => (
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
              Unable to generate insights
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default MatchScoreCard;