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
  const { data: restaurant, error: restaurantError } = useRestaurantData(placeId);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession) {
          checkIfSaved(currentSession.user.id);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          if (session) {
            setShowAuthModal(false);
            checkIfSaved(session.user.id);
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Auth error:", error);
        toast.error("Failed to load authentication state");
      }
    };

    setupAuth();
  }, [placeId]);

  const checkIfSaved = async (userId: string) => {
    try {
      console.log("🔍 Checking if restaurant is saved for user:", userId);
      const { data, error } = await supabase
        .from('saved_restaurants')
        .select('id')
        .eq('user_id', userId)
        .eq('place_id', placeId);

      if (error) {
        console.error("❌ Error checking saved status:", error);
        throw error;
      }

      console.log("✅ Found saved restaurant data:", data);
      setIsSaved(data && data.length > 0);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSave = async () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    if (!restaurant) {
      toast.error("Restaurant information not available");
      return;
    }

    try {
      setIsSaving(true);

      if (isSaved) {
        const { error } = await supabase
          .from('saved_restaurants')
          .delete()
          .eq('user_id', session.user.id)
          .eq('place_id', placeId);

        if (error) throw error;

        setIsSaved(false);
        toast.success("Restaurant removed from your saved list");
      } else {
        const { error } = await supabase
          .from('saved_restaurants')
          .insert({
            user_id: session.user.id,
            place_id: placeId,
            name: restaurant.name,
            image_url: restaurant.photos?.[0] || null,
            cuisine: restaurant.types?.[0] || null,
            rating: restaurant.rating || null,
            address: restaurant.address || null,
          });

        if (error) throw error;

        setIsSaved(true);
        toast.success("Restaurant saved to your list!");
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
      toast.error("Failed to update saved restaurants");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    try {
      if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        await navigator.share({
          title: restaurant?.name || 'Check out this restaurant',
          text: 'I found this great restaurant!',
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Failed to share restaurant");
    }
  };

  if (restaurantError) {
    toast.error("Failed to load restaurant information");
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col sm:flex-row gap-3 z-50">
        <Button
          variant="outline"
          size="lg"
          className="bg-white/80 backdrop-blur-sm hover:bg-white w-full sm:w-auto shadow-lg text-base px-6"
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-6 w-6" />
          Share
        </Button>
        <Button
          size="lg"
          className={`bg-primary text-white hover:bg-primary/90 transition-all duration-300 w-full sm:w-auto shadow-lg text-base px-6
            ${isSaving ? 'scale-105 bg-green-500' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Check className="mr-2 h-6 w-6 animate-[scale-in_0.2s_ease-out]" />
          ) : isSaved ? (
            <BookmarkCheck className="mr-2 h-6 w-6" />
          ) : (
            <BookmarkPlus className="mr-2 h-6 w-6" />
          )}
          {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
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