import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SavePrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show prompt on desktop
    const isDesktop = window.innerWidth >= 640; // sm breakpoint
    if (isDesktop) {
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        // Check if user has dismissed this prompt before
        const hasSeenPrompt = localStorage.getItem('hasSeenSavePrompt');
        if (!hasSeenPrompt) {
          setShow(true);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('hasSeenSavePrompt', 'true');
  };

  if (!show) return null;

  return (
    <>
      <Alert className="fixed bottom-28 right-6 w-72 bg-primary/5 backdrop-blur-sm shadow-lg border-primary/20 animate-fade-up hidden sm:flex items-center gap-3">
        <div className="flex-1">
          <AlertDescription className="text-sm font-medium text-primary">
            Save this restaurant to your collection!
          </AlertDescription>
          <AlertDescription className="text-xs text-muted-foreground mt-1">
            Click the button below to save for later
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/10"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>

      {/* Visual arrow connecting to save button */}
      <div className="fixed bottom-[88px] right-24 hidden sm:block animate-fade-up">
        <ArrowDownRight className="h-8 w-8 text-primary animate-pulse" />
      </div>
    </>
  );
};

export default SavePrompt;