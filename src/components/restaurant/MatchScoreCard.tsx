import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRestaurantMatch } from "@/hooks/useRestaurantMatch";
import { RestaurantDetails } from "@/types/restaurant";
import { Sparkles, ThumbsUp, AlertCircle } from "lucide-react";

interface MatchScoreCardProps {
  restaurant: RestaurantDetails;
}

const MatchScoreCard = ({ restaurant }: MatchScoreCardProps) => {
  const { overallScore, categories, loading, error } = useRestaurantMatch(restaurant);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-gray-200 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null;
  }

  // Placeholder match reasons (these would come from the backend in production)
  const matchReasons = [
    {
      type: "positive",
      text: "Perfect match for your favorite cuisine preferences",
      icon: <ThumbsUp className="w-5 h-5 text-success" />
    },
    {
      type: "positive",
      text: "Offers plenty of vegetarian options you'll love",
      icon: <Sparkles className="w-5 h-5 text-primary" />
    },
    {
      type: "warning",
      text: "Slightly above your preferred price range",
      icon: <AlertCircle className="w-5 h-5 text-warning" />
    }
  ];

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
                {overallScore}%
              </div>
              <Progress value={overallScore} className="flex-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {categories.map((category) => (
                <div 
                  key={category.category}
                  className="flex items-start gap-2 p-3 bg-white/50 rounded-lg"
                >
                  <span className="text-xl">{category.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-secondary">
                      {category.category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {category.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchScoreCard;