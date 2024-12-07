import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SavedRestaurants from "@/components/profile/SavedRestaurants";
import Header from "@/components/Header";
import AuthModal from "@/components/auth/AuthModal";

const Saved = () => {
  const [session, setSession] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setShowAuthModal(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setShowAuthModal(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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