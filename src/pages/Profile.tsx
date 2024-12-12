import { Card } from "@/components/ui/card";
import ProfileSettings from "@/components/profile/ProfileSettings";
import RestaurantPreferences from "@/components/profile/RestaurantPreferences";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AuthModal from "@/components/auth/AuthModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔄 Setting up auth state in Profile page");
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("📌 Initial session check:", session ? "Session found" : "No session");
      setSession(session);
      setIsLoading(false);
      
      if (!session) {
        console.log("🚫 No session found, showing auth modal");
        setShowAuthModal(true);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔐 Auth state changed:", _event, session?.user?.id);
      setSession(session);
      
      if (!session) {
        console.log("🚫 Session ended, redirecting to home");
        navigate("/");
      }
    });

    return () => {
      console.log("♻️ Cleaning up auth listener in Profile page");
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <AuthModal 
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 md:py-12 px-4 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Restaurant Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              <span>Account Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences">
            <Card className="p-6">
              <RestaurantPreferences />
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="p-6">
              <ProfileSettings />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;