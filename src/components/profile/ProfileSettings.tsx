import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Profile Settings</h2>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        {isEditing ? (
          <Input
            id="name"
            value={userDetails.name}
            onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
          />
        ) : (
          <p className="text-gray-700">{userDetails.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <p className="text-gray-700">{userDetails.email}</p>
      </div>

      <div className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <button
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </>
        ) : (
          <button
            className="px-4 py-2 text-sm text-primary hover:text-primary/90"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;