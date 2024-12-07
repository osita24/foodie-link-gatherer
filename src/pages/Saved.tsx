import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookmarkPlus } from "lucide-react";
import SavedRestaurants from "@/components/profile/SavedRestaurants";

const Saved = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-md">
          <BookmarkPlus className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to save restaurants</h2>
          <p className="text-gray-600 mb-6">
            Create an account to keep track of your favorite dining spots
          </p>
          <Button 
            onClick={() => navigate("/")} 
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Saved Restaurants</h1>
      <SavedRestaurants />
    </div>
  );
};

export default Saved;