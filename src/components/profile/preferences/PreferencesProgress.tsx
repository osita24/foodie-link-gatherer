import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface PreferencesProgressProps {
  completionPercentage: number;
}

const PreferencesProgress = ({ completionPercentage }: PreferencesProgressProps) => {
  return (
    <div className="space-y-4 bg-white p-6 rounded-lg border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Profile Completion</h2>
        <span className="text-lg font-semibold text-primary">
          {completionPercentage}%
        </span>
      </div>
      
      <Progress value={completionPercentage} className="h-3" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div className="flex items-center gap-2">
          {completionPercentage >= 20 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-sm">Dietary Preferences</span>
        </div>
        <div className="flex items-center gap-2">
          {completionPercentage >= 40 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-sm">Cuisine Preferences</span>
        </div>
        <div className="flex items-center gap-2">
          {completionPercentage >= 60 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-sm">Foods to Avoid</span>
        </div>
        <div className="flex items-center gap-2">
          {completionPercentage >= 80 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-sm">Atmosphere Preferences</span>
        </div>
        <div className="flex items-center gap-2">
          {completionPercentage >= 100 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-sm">Protein Preferences</span>
        </div>
      </div>
    </div>
  );
};

export default PreferencesProgress;