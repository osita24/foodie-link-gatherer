import { useState } from "react";
import { BookmarkPlus, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ActionButtons = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    console.log('Restaurant saved');
    
    toast({
      title: "Restaurant Saved!",
      description: "Added to your favorites",
      duration: 2000,
    });

    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-40 flex flex-row gap-2 justify-end">
      <Button
        size="lg"
        className={`shadow-lg bg-primary text-white hover:bg-primary/90 transition-all duration-300 flex-1 sm:flex-none
          ${isSaving ? 'scale-105 bg-green-500' : ''}`}
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <Check className="mr-2 h-5 w-5 animate-[scale-in_0.2s_ease-out]" />
        ) : (
          <BookmarkPlus className="mr-2 h-5 w-5" />
        )}
        {isSaving ? 'Saved!' : 'Save'}
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="shadow-lg bg-white hover:bg-white flex-1 sm:flex-none"
        onClick={() => console.log('Share clicked')}
      >
        <Share2 className="mr-2 h-5 w-5" />
        Share
      </Button>
    </div>
  );
};

export default ActionButtons;