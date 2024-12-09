import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfile = () => {
  const [userName, setUserName] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const session = useSession();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) {
        console.log("👤 No user session found");
        return;
      }

      setIsLoadingProfile(true);
      console.log("🔍 Fetching profile for user:", session.user.id);

      try {
        const { data: existingProfile, error: checkError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .maybeSingle();

        if (checkError) {
          console.error("❌ Error checking profile:", checkError);
          throw checkError;
        }

        if (!existingProfile) {
          console.log("⚠️ No profile found, creating one...");
          const defaultName = session.user.email?.split("@")[0] || "User";
          
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ 
              id: session.user.id,
              full_name: defaultName
            }]);

          if (insertError) {
            console.error("❌ Error creating profile:", insertError);
            throw insertError;
          }

          setUserName(defaultName);
        } else {
          console.log("✅ Profile found:", existingProfile);
          setUserName(existingProfile.full_name || session.user.email?.split("@")[0] || "User");
        }
      } catch (error: any) {
        console.error("❌ Profile error:", error);
        setUserName(session.user.email?.split("@")[0] || "User");
        toast.error("Failed to load profile");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [session]);

  return { userName, isLoadingProfile, session };
};