import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import SavedRestaurants from "@/components/profile/SavedRestaurants";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";

const Saved = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <UtensilsCrossed className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Sign in to view saved restaurants</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Create an account to save your favorite restaurants and access them anytime.
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-primary hover:bg-primary/90"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return <SavedRestaurants />;
};

export default Saved;