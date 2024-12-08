import { Button } from "@/components/ui/button";

interface PreferencesSaveButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const PreferencesSaveButton = ({ onClick, disabled }: PreferencesSaveButtonProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:relative md:border-0 md:p-0 md:bg-transparent">
      <Button 
        onClick={onClick} 
        className="w-full md:w-auto"
        disabled={disabled}
      >
        Save Preferences
      </Button>
    </div>
  );
};

export default PreferencesSaveButton;