import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const ProfileSettings = () => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Name</Label>
          {isEditing ? (
            <Input
              id="name"
              value={userDetails.name}
              onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
              className="max-w-md transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your name"
            />
          ) : (
            <p className="text-lg text-foreground/90 font-medium">{userDetails.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <p className="text-lg text-foreground/90 font-medium">{userDetails.email}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {isEditing ? (
          <>
            <motion.button
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
              onClick={handleSave}
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </>
        ) : (
          <motion.button
            className="px-4 py-2 text-sm text-primary hover:text-primary/90 transition-colors"
            onClick={() => setIsEditing(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Edit Profile
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileSettings;