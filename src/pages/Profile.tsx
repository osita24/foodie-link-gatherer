import { Card } from "@/components/ui/card";
import ProfileSettings from "@/components/profile/ProfileSettings";
import RestaurantPreferences from "@/components/profile/RestaurantPreferences";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

const Profile = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

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