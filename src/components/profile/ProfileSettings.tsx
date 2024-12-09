import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Circle } from "lucide-react";

const ProfileSettings = () => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

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

        // Fetch preferences to calculate completion
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setUserDetails({
          name: profile?.full_name || "",
          email: user.email || "",
        });

        // Calculate completion percentage
        if (preferences) {
          let completed = 0;
          let total = 5;

          if (preferences.cuisine_preferences?.length > 0) completed++;
          if (preferences.dietary_restrictions?.length > 0) completed++;
          if (preferences.favorite_ingredients?.length > 0) completed++;
          if (preferences.atmosphere_preferences?.length > 0) completed++;
          if (preferences.favorite_proteins?.length > 0) completed++;

          setCompletionPercentage((completed / total) * 100);
        }
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
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Profile Settings</h2>
        {completionPercentage < 100 && (
          <div className="relative flex items-center">
            <Circle 
              className="w-3 h-3 fill-green-500 text-green-500" 
              aria-label="Profile incomplete"
            />
            <div className="absolute -right-1 -top-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>

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