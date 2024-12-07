import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";

interface MenuHeaderProps {
  menuUrl?: string;
}

const MenuHeader = ({ menuUrl }: MenuHeaderProps) => {
  const [session, setSession] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session);
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="relative w-full bg-background rounded-lg p-6 mb-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-semibold">Menu Match</h2>
            <Badge 
              variant="secondary" 
              className="text-xs bg-accent/50 text-secondary/70"
            >
              Beta
            </Badge>
          </div>
          
          {!session && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign up to see how well this menu matches your preferences
              </p>
              <Button 
                variant="default" 
                className="w-full sm:w-auto"
                onClick={() => setShowAuthModal(true)}
              >
                Sign up to see match score
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-2 text-center">
            <p>Menu information is automatically processed and continuously improving</p>
          </div>
        </div>
      </div>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default MenuHeader;