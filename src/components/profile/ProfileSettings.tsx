import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";

const ProfileSettings = () => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        console.log("🔍 Fetching user profile data...");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("👤 Found user:", user.id);
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (error) {
            console.error("❌ Error fetching profile:", error);
            throw error;
          }

          if (profile) {
            console.log("✅ Profile found:", profile);
            setUserDetails({
              name: profile.full_name || "",
              email: user.email || "",
            });
          } else {
            console.log("⚠️ No profile found, using email as name");
            setUserDetails({
              name: user.email?.split('@')[0] || "",
              email: user.email || "",
            });
          }
        }
      } catch (error: any) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load profile information");
      }
    };

    getUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("💾 Saving profile updates...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id,
            full_name: userDetails.name,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        console.log("✅ Profile updated successfully");
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Account Settings</h2>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          {isEditing ? (
            <Input
              id="name"
              value={userDetails.name}
              onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
              placeholder="Enter your name"
              className="max-w-md"
            />
          ) : (
            <p className="text-lg">{userDetails.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <p className="text-lg text-muted-foreground">{userDetails.email}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[100px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="min-w-[100px]"
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;