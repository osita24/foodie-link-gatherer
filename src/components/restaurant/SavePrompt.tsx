import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
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
      <Alert className="fixed bottom-28 right-6 w-72 bg-background/95 backdrop-blur-sm shadow-lg border-primary/20 animate-fade-up hidden sm:block">
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Click here to save this restaurant!
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
      {/* Visual arrow connecting to save button */}
      <div className="fixed bottom-[88px] right-24 w-8 h-8 border-r-2 border-b-2 border-primary/20 hidden sm:block animate-fade-up" />
    </>
  );
};

export default SavePrompt;