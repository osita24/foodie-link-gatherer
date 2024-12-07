import { Progress } from "@/components/ui/progress";

interface PreferencesProgressProps {
  completionPercentage: number;
}

const PreferencesProgress = ({ completionPercentage }: PreferencesProgressProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Complete Your Taste Profile</h2>
      <Progress value={completionPercentage} className="h-2" />
      <p className="text-sm text-gray-500">
        {completionPercentage === 100 
          ? "All preferences set! Feel free to update them anytime."
          : "Fill out your preferences to get better restaurant recommendations"}
      </p>
    </div>
  );
};

export default PreferencesProgress;