import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SavedRestaurants from "@/components/profile/SavedRestaurants";
import Header from "@/components/Header";
import UnauthenticatedState from "@/components/auth/UnauthenticatedState";
import AuthModal from "@/components/auth/AuthModal";

const Saved = () => {
  const [session, setSession] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <UnauthenticatedState
          title="Your Restaurant Collection"
          description="Create your personal collection of favorite restaurants. Save places you love or want to try, and access them anytime, anywhere."
          onAuthClick={() => setShowAuthModal(true)}
        />
        <AuthModal 
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-20 px-4">
        <h1 className="text-2xl font-bold mb-6">Saved Restaurants</h1>
        <SavedRestaurants />
      </div>
    </div>
  );
};

export default Saved;