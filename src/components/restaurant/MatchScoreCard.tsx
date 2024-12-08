import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";
import { generateRestaurantInsights } from "@/utils/restaurantInsights";
import { mapSupabaseToUserPreferences } from "@/utils/preferencesMapper";

interface MatchCategory {
  category: string;
  score: number;
  description: string;
  icon: string;
}

interface MatchScoreCardProps {
  categories: MatchCategory[];
  restaurant: any;
}

const MatchScoreCard = ({ categories, restaurant }: MatchScoreCardProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState(null);
  const [insights, setInsights] = useState<{ matchScore: number; reasons: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowAuthModal(false);
      }
    });
  }, []);

  useEffect(() => {
    const loadInsights = async () => {
      if (!session?.user) return;

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

  const UnauthenticatedContent = () => (
    <div className="space-y-8 text-center py-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-secondary">
            Discover Your Perfect Match
          </h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            Find out exactly why this restaurant matches your taste preferences. Our AI analyzes hundreds of data points to create your personalized match score.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold
              transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg
              relative overflow-hidden group"
          >
            <span className="relative z-10">View My Match Score</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
          <p className="text-sm text-gray-500">
            Sign up in seconds to unlock your personalized restaurant matches
          </p>
        </div>
      </div>
    </div>
  );

  const AuthenticatedContent = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : insights ? (
        <>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-primary">
                {insights.matchScore}%
              </span>
              <span className="text-lg text-gray-600">match</span>
            </div>
          </div>
          <div className="space-y-4">
            {insights.reasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-accent/5 animate-fade-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-600">
          Unable to generate insights at this time
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 relative z-10
        bg-white border-accent/20 mb-20 sm:mb-0">
        {session && (
          <CardHeader className="border-b border-accent/20 md:p-6 p-4 
            bg-gradient-to-r from-primary/5 to-accent/10">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-current" />
              Your Personalized Match Score
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={session ? "md:pt-6 pt-4 p-4 md:p-6" : "p-4"}>
          {session ? <AuthenticatedContent /> : <UnauthenticatedContent />}
        </CardContent>
      </Card>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </>
  );
};

export default MatchScoreCard;