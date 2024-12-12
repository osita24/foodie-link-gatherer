import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PreferencesSaveButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading?: boolean;
}

const PreferencesSaveButton = ({ onClick, disabled, loading }: PreferencesSaveButtonProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t md:relative md:border-0 md:p-0 md:bg-transparent">
      <Button 
        onClick={onClick} 
        className="w-full md:w-auto transition-all duration-200"
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Preferences'
        )}
      </Button>
    </div>
  );
};

export default PreferencesSaveButton;