import { Card, CardContent } from "@/components/ui/card";
import { Loader2, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuLoadingStateProps {
  isProcessing?: boolean;
}

const MenuLoadingState = ({ isProcessing }: MenuLoadingStateProps) => {
  if (isProcessing) {
    return (
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg animate-fade-up">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center justify-center mb-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-secondary text-lg font-medium">
              Processing Menu Information
            </p>
            <p className="text-muted-foreground text-sm mt-2 text-center">
              We're analyzing available information to create your personalized digital menu
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="p-4 border rounded-lg space-y-3 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg animate-fade-up">
      <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
        <List className="w-8 h-8 text-muted-foreground mb-4" />
        <p className="text-secondary text-lg font-medium">
          Menu Not Available
        </p>
        <p className="text-muted-foreground text-sm mt-2 text-center">
          We're working on getting the latest menu information.
        </p>
      </CardContent>
    </Card>
  );
};

export default MenuLoadingState;