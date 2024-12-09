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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserDetails({
          name: profile?.full_name || "",
          email: user.email || "",
        });
      }
    };

    getUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: userDetails.name })
          .eq('id', user.id);

        if (error) throw error;

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