import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SavePrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show prompt after a short delay
    const timer = setTimeout(() => {
      // Check if user has dismissed this prompt before
      const hasSeenPrompt = localStorage.getItem('hasSeenSavePrompt');
      if (!hasSeenPrompt) {
        setShow(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('hasSeenSavePrompt', 'true');
  };

  if (!show) return null;

  return (
    <Alert className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-background/95 backdrop-blur-sm shadow-lg border-primary/20 animate-fade-up">
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Save this restaurant to your collection for easy access later!
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
  );
};

export default SavePrompt;