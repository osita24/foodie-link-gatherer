import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

const MatchScorePrompt = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10 border-accent/20 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-3 flex-1">
            <h3 className="text-lg font-semibold text-secondary">
              Get Your Personalized Match Score
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              See how well this restaurant matches your taste preferences. Our AI analyzes your dining history and preferences to create a personalized compatibility score.
            </p>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              View Match Score
            </Button>
          </div>
        </div>
      </CardContent>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </Card>
  );
};

export default MatchScorePrompt;