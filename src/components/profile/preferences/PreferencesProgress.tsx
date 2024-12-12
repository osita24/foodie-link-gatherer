import { Progress } from "@/components/ui/progress";

interface PreferencesProgressProps {
  completionPercentage: number;
}

const PreferencesProgress = ({ completionPercentage }: PreferencesProgressProps) => {
  return (
    <div className="space-y-2 bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Profile Completion</h3>
        <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
      </div>
      <Progress value={completionPercentage} className="h-2" />
      {completionPercentage < 100 && (
        <p className="text-sm text-muted-foreground mt-2">
          Complete your preferences to get better restaurant recommendations
        </p>
      )}
    </div>
  );
};

export default PreferencesProgress;