import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { RestaurantDetails } from "@/types/restaurant";

interface RestaurantSummaryCardProps {
  restaurant: RestaurantDetails;
  isAuthenticated: boolean;
}

const RestaurantSummaryCard = ({ restaurant, isAuthenticated }: RestaurantSummaryCardProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isAuthenticated) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10 border-accent/20 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-semibold text-secondary">
                Get Your Personalized Restaurant Match
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                See how well {restaurant.name} matches your taste preferences. Our AI analyzes your dining preferences to create a personalized compatibility score.
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
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10 border-accent/20">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-secondary">
                Your Restaurant Match
              </h3>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">
                85%
              </div>
              <Progress value={85} className="flex-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                { icon: "🥘", category: "Cuisine", description: "Matches your favorite cuisine type" },
                { icon: "🥗", category: "Dietary", description: "Aligns with your dietary preferences" },
                { icon: "✨", category: "Atmosphere", description: "Matches your preferred dining style" },
                { icon: "💰", category: "Price", description: "Within your preferred price range" }
              ].map((item) => (
                <div 
                  key={item.category}
                  className="flex items-start gap-2 p-3 bg-white/50 rounded-lg"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-secondary">
                      {item.category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

export default RestaurantSummaryCard;