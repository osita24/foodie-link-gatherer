import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
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
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: userDetails.name })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        {isEditing ? (
          <div className="flex gap-2">
            <Input 
              id="name" 
              value={userDetails.name} 
              onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1"
            />
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-20"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              className="w-20"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <Input 
              id="name" 
              value={userDetails.name} 
              disabled 
              className="bg-muted"
            />
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              className="w-20"
            >
              Edit
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={userDetails.email} 
          disabled 
          className="bg-muted"
        />
      </div>
    </div>
  );
};

export default ProfileSettings;