import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const ProfileCompletionNudge = () => {
  const navigate = useNavigate();
  const { completionPercentage } = useProfile();

  if (completionPercentage >= 80) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-accent/20 mb-6 overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-lg shrink-0">
            <UserCog className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-3 flex-1">
            <h3 className="text-lg font-semibold text-secondary">
              Get Better Restaurant Matches
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete your dining preferences to receive personalized restaurant recommendations tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => navigate("/profile")}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Complete Profile
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-full sm:w-32 h-2 bg-accent/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="whitespace-nowrap">{completionPercentage}% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionNudge;