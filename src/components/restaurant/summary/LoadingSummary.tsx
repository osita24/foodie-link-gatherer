import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSummary = () => {
  return (
    <Card className="p-4 md:p-6 bg-background border-accent">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Cilantro Says</h3>
          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">BETA</span>
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </Card>
  );
};