import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const SavePrompt = () => {
  const [show, setShow] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Don't show on mobile
    if (isMobile) {
      return;
    }

    // Show prompt after a short delay
    const timer = setTimeout(() => {
      // Check if user has dismissed this prompt before
      const hasSeenPrompt = localStorage.getItem('hasSeenSavePrompt');
      if (!hasSeenPrompt) {
        setShow(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isMobile]);

  const handleDismiss = () => {
    console.log("🔔 Dismissing save prompt");
    setShow(false);
    localStorage.setItem('hasSeenSavePrompt', 'true');
  };

  if (!show || isMobile) return null;

  return (
    <Alert className="fixed bottom-24 right-4 w-96 bg-background/95 backdrop-blur-sm shadow-lg border-primary/20 animate-fade-up">
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Save this restaurant to your collection for easy access later!
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-gray-100"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default SavePrompt;