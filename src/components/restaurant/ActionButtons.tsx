import { useState, useEffect } from "react";
import { BookmarkPlus, Share2, Check, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "../auth/AuthModal";
import { useParams } from "react-router-dom";
import { useRestaurantData } from "@/hooks/useRestaurantData";

const ActionButtons = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState(null);
  const { id: placeId } = useParams();
  const { data: restaurant } = useRestaurantData(placeId);

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
        toast("Successfully signed in!", {
          description: `Welcome ${session.user.email}`,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [placeId]);

  const checkIfSaved = async (userId: string) => {
    console.log("Checking if restaurant is saved...");
    const { data, error } = await supabase
      .from('saved_restaurants')
      .select('id')
      .eq('user_id', userId)
      .eq('place_id', placeId);

    if (error) {
      console.error("Error checking saved status:", error);
      return;
    }

    setIsSaved(data.length > 0);
    console.log("Restaurant saved status:", data.length > 0);
  };

  const handleSave = async () => {
    if (!session) {
      console.log("No session, showing auth modal");
      setShowAuthModal(true);
      return;
    }

    try {
      setIsSaving(true);
      console.log("Saving restaurant...", restaurant);

      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_restaurants')
          .delete()
          .eq('user_id', session.user.id)
          .eq('place_id', placeId);

        if (error) throw error;

        setIsSaved(false);
        toast("Restaurant removed", {
          description: "Restaurant removed from your saved list!",
        });
      } else {
        // Add to saved with enhanced details
        const { error } = await supabase
          .from('saved_restaurants')
          .insert({
            user_id: session.user.id,
            place_id: placeId,
            name: restaurant?.name || "Unknown Restaurant",
            image_url: restaurant?.photos?.[0] || null,
            cuisine: restaurant?.types?.[0] || null,
            rating: restaurant?.rating || null,
            address: restaurant?.address || null,
          });

        if (error) throw error;

        setIsSaved(true);
        toast("Restaurant saved!", {
          description: "Find it in your saved tab.",
        });
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
      toast("Failed to save", {
        description: "Failed to save restaurant. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    // Check if running on mobile
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: restaurant?.name || 'Check out this restaurant',
          text: 'I found this great restaurant!',
          url: url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Desktop fallback - copy to clipboard
      navigator.clipboard.writeText(url);
      toast("Link copied!", {
        description: "Restaurant link copied to clipboard",
      });
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 flex flex-col sm:flex-row gap-2 z-50 md:static md:mt-4 md:mb-6">
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