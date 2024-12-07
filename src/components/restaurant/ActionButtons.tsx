import { useState, useEffect } from "react";
import { BookmarkPlus, Share2, Check, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "../auth/AuthModal";
import { useParams } from "react-router-dom";

const ActionButtons = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState(null);
  const { id: placeId } = useParams();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session);
      setSession(session);
      if (session) {
        checkIfSaved(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      if (session) {
        setShowAuthModal(false);
        checkIfSaved(session.user.id);
        toast("Welcome!", {
          description: `Signed in as ${session.user.email}`,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [placeId]);

  const checkIfSaved = async (userId: string) => {
    console.log("Checking if restaurant is saved...");
    try {
      const { data, error } = await supabase
        .from('saved_restaurants')
        .select('id')
        .eq('user_id', userId)
        .eq('place_id', placeId);

      if (error) {
        console.error("Error checking saved status:", error);
        return;
      }

      setIsSaved(data && data.length > 0);
      console.log("Restaurant saved status:", data && data.length > 0);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSave = async () => {
    if (!session) {
      console.log("No session, showing auth modal");
      setShowAuthModal(true);
      return;
    }

    try {
      setIsSaving(true);
      console.log("Saving restaurant...");

      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_restaurants')
          .delete()
          .eq('user_id', session.user.id)
          .eq('place_id', placeId);

        if (error) throw error;

        setIsSaved(false);
        toast.success("Restaurant removed from your saved list!");
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_restaurants')
          .insert({
            user_id: session.user.id,
            place_id: placeId,
            name: document.title, // This will get the restaurant name from the page title
            image_url: document.querySelector('img')?.src, // Get the first image from the page
          });

        if (error) throw error;

        setIsSaved(true);
        toast.success("Restaurant saved! Find it in your saved tab.");
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
      toast.error("Failed to save restaurant. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    console.log("Share clicked");
    toast("Share feature", {
      description: "Coming soon!",
    });
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 flex flex-col sm:flex-row gap-2 z-50 md:absolute md:bottom-4 md:right-4 md:left-auto">
        <Button
          size="lg"
          className={`bg-primary text-white hover:bg-primary/90 transition-all duration-300 w-full sm:w-auto shadow-lg
            ${isSaving ? 'scale-105 bg-green-500' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Check className="mr-2 h-5 w-5 animate-[scale-in_0.2s_ease-out]" />
          ) : isSaved ? (
            <BookmarkCheck className="mr-2 h-5 w-5" />
          ) : (
            <BookmarkPlus className="mr-2 h-5 w-5" />
          )}
          {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="bg-white/80 backdrop-blur-sm hover:bg-white w-full sm:w-auto shadow-lg"
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-5 w-5" />
          Share
        </Button>
      </div>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </>
  );
};

export default ActionButtons;