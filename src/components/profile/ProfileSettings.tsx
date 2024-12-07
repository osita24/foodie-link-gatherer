import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProfileSettings = () => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserDetails({
          name: user.user_metadata.full_name || "",
          email: user.email || "",
        });
        setEditedName(user.user_metadata.full_name || "");
      }
    };

    getUser();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: editedName }
      });

      if (error) throw error;

      setUserDetails(prev => ({
        ...prev,
        name: editedName
      }));
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your name has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Error",
        description: "Failed to update your name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Input 
                id="name" 
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1"
                placeholder="Enter your name"
              />
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(userDetails.name);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Input 
                id="name" 
                value={userDetails.name} 
                disabled 
                className="bg-muted flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
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