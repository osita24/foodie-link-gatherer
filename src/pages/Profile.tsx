import { Card } from "@/components/ui/card";
import ProfileSettings from "@/components/profile/ProfileSettings";
import RestaurantPreferences from "@/components/profile/RestaurantPreferences";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AuthModal from "@/components/auth/AuthModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, UtensilsCrossed } from "lucide-react";

const Profile = () => {
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