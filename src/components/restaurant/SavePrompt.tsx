import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowDownRight } from "lucide-react";

const SavePrompt = () => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShouldShow(false);
  };

  if (!shouldShow) return null;

  return (
    <>
      <Alert 
        className="fixed bottom-[88px] right-6 w-[280px] bg-white/95 backdrop-blur border-primary/20 shadow-lg animate-fade-up hidden sm:flex"
        onClick={handleDismiss}
      >
        <AlertDescription className="text-sm text-primary">
          Save this restaurant to view it later in your profile
        </AlertDescription>
      </Alert>

      {/* Visual arrow connecting to save button */}
      <div className="fixed bottom-[88px] right-6 hidden sm:block animate-fade-up">
        <ArrowDownRight className="h-8 w-8 text-primary animate-pulse" />
      </div>
    </>
  );
};

export default SavePrompt;
