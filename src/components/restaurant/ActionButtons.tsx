import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "../auth/AuthModal";
import { useRestaurantData } from "@/hooks/useRestaurantData";
import ShareButton from "./buttons/ShareButton";
import SaveButton from "./buttons/SaveButton";

const ActionButtons = () => {
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

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col sm:flex-row gap-3 z-50">
        <ShareButton placeId={placeId} />
        <SaveButton
          placeId={placeId}
          isSaved={isSaved}
          session={session}
          onAuthRequired={() => setShowAuthModal(true)}
          restaurant={restaurant}
        />
      </div>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </>
  );
};

export default ActionButtons;