import { Card } from "@/components/ui/card";
import ProfileSettings from "@/components/profile/ProfileSettings";
import RestaurantPreferences from "@/components/profile/RestaurantPreferences";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import UnauthenticatedState from "@/components/auth/UnauthenticatedState";
import AuthModal from "@/components/auth/AuthModal";

const Profile = () => {
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
          title="Access Your Profile"
          description="Sign in to manage your dining preferences, view your saved restaurants, and get personalized recommendations tailored just for you."
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
      <div className="container mx-auto py-20 px-4 space-y-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
            <ProfileSettings />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Restaurant Preferences</h2>
            <RestaurantPreferences />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;