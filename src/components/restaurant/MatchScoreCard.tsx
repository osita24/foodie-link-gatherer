import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";

interface MatchCategory {
  category: string;
  score: number;
  description: string;
  icon: string;
}

interface MatchScoreCardProps {
  categories: MatchCategory[];
}

const MatchScoreCard = ({ categories }: MatchScoreCardProps) => {
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [session, setSession] = useState(null);

  // Listen for auth state changes
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    if (session) {
      setShowSignUpDialog(false);
    }
  });

  const UnauthenticatedContent = () => (
    <div className="space-y-6 text-center py-8">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-secondary">
          Discover Your Perfect Match!
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Find out exactly why this restaurant matches your taste preferences. Our AI analyzes hundreds of data points to create your personalized match score.
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => setShowSignUpDialog(true)}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold
              transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg"
          >
            View My Match Score
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Sign up in seconds to unlock your personalized restaurant matches
        </p>
      </div>
    </div>
  );

  const AuthenticatedContent = () => (
    <div className="space-y-4 md:space-y-6">
      {categories.map((item, index) => (
        <div
          key={item.category}
          className="space-y-1.5 md:space-y-2 animate-fade-up"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-lg md:text-xl">{item.icon}</span>
              <span className="font-medium text-secondary text-sm md:text-base text-left">
                {item.category}
              </span>
            </div>
            <span className="text-primary font-bold text-sm md:text-base">
              {item.score}%
            </span>
          </div>
          <div className="relative pt-0.5 md:pt-1">
            <div className="overflow-hidden h-1.5 md:h-2 text-xs flex rounded-full bg-gray-100">
              <div
                style={{ width: `${item.score}%` }}
                className="animate-[slideRight_1s_ease-out] shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
              />
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-600 text-left">{item.description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 relative z-[90]">
        <CardHeader className="border-b border-gray-100 md:p-6 p-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-left">
            <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-current" />
            Why We Think You'll Love It
          </CardTitle>
        </CardHeader>
        <CardContent className="md:pt-6 pt-4 p-4 md:p-6">
          {session ? <AuthenticatedContent /> : <UnauthenticatedContent />}
        </CardContent>
      </Card>

      <Dialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign up to see your match score</DialogTitle>
            <DialogDescription>
              Create a free account to unlock personalized restaurant recommendations and match scores.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#000000',
                      brandAccent: '#333333',
                    },
                  },
                },
              }}
              providers={['google']}
              onlyThirdPartyProviders
              redirectTo={window.location.origin}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MatchScoreCard;