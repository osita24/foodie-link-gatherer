import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantDetails } from "@/types/restaurant";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RestaurantSummaryProps {
  restaurant: RestaurantDetails;
}

interface SummaryResponse {
  recommendation: "SKIP IT" | "WORTH A TRY" | "MUST VISIT";
  reasons: string[];
}

const RestaurantSummary = ({ restaurant }: RestaurantSummaryProps) => {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    const generateSummary = async () => {
      if (!session?.user) return;

      console.log("🤖 Generating personalized summary for:", restaurant.name);
      try {
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        console.log("👤 User preferences loaded:", preferences);

        const { data, error } = await supabase.functions.invoke("restaurant-summary", {
          body: { restaurant, preferences }
        });

        if (error) throw error;

        console.log("✨ Generated summary:", data);
        setSummary(data);
      } catch (error) {
        console.error("❌ Error generating summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
  }, [restaurant, session]);

  if (!session?.user) return null;

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "MUST VISIT":
        return "text-green-500";
      case "WORTH A TRY":
        return "text-yellow-500";
      case "SKIP IT":
        return "text-red-500";
      default:
        return "text-primary";
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Restaurant Summary</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Restaurant Summary</h3>
      </div>
      
      <div className="space-y-4">
        <h4 className={`text-2xl font-bold ${getRecommendationColor(summary.recommendation)}`}>
          {summary.recommendation}
        </h4>
        
        <div className="space-y-2">
          {summary.reasons.map((reason, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-primary">#{index + 1}</span>
              <p className="text-muted-foreground">{reason}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RestaurantSummary;