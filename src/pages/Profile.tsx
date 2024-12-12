import { Card } from "@/components/ui/card";
import ProfileSettings from "@/components/profile/ProfileSettings";
import RestaurantPreferences from "@/components/profile/RestaurantPreferences";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AuthModal from "@/components/auth/AuthModal";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔄 Setting up auth state change listener");
    let mounted = true;

    const setupAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("❌ Error getting session:", sessionError);
          throw sessionError;
        }

        console.log("🔍 Initial session check:", initialSession ? "Session found" : "No session");
        
        if (mounted) {
          setSession(initialSession);
          setShowAuthModal(!initialSession);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ Auth setup error:", error);
        if (mounted) {
          setIsLoading(false);
          setShowAuthModal(true);
        }
      }
    };

    setupAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("🔐 Auth state changed:", event, currentSession?.user?.id);
      
      if (mounted) {
        setSession(currentSession);
        
        if (event === 'SIGNED_OUT' || (!currentSession && event === 'INITIAL_SESSION')) {
          setShowAuthModal(true);
          navigate('/');
        } else if (currentSession) {
          setShowAuthModal(false);
        }
      }
    });

    return () => {
      console.log("♻️ Cleaning up auth state change listener");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-20 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="container mx-auto py-20 px-4 space-y-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        
        <div className="space-y-8">
          <Card className="p-6">
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