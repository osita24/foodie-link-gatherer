import { Card, CardContent } from "@/components/ui/card";
import { Loader2, List } from "lucide-react";

interface MenuLoadingStateProps {
  isProcessing?: boolean;
}

const MenuLoadingState = ({ isProcessing }: MenuLoadingStateProps) => {
  if (isProcessing) {
    return (
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 animate-pulse rounded-md w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-lg space-y-3">
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-2/3" />
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2" />
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
      <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
        <List className="w-8 h-8 text-muted-foreground mb-4" />
        <p className="text-secondary text-lg font-medium">
          Menu Not Available
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          We're working on getting the latest menu information.
        </p>
      </CardContent>
    </Card>
  );
};

export default MenuLoadingState;