import { Card, CardContent } from "@/components/ui/card";
import { Loader2, List } from "lucide-react";

interface MenuLoadingStateProps {
  isProcessing?: boolean;
}

const MenuLoadingState = ({ isProcessing }: MenuLoadingStateProps) => {
  if (isProcessing) {
    return (
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-secondary text-lg font-medium">
            Processing Menu...
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Analyzing available information to create your digital menu
          </p>
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