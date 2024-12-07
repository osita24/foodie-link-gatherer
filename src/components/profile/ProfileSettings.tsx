import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProfileSettings = () => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserDetails({
          name: user.user_metadata.full_name || "",
          email: user.email || "",
        });
      }
    };

    getUser();
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          value={userDetails.name} 
          disabled 
          className="bg-muted"
        />
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