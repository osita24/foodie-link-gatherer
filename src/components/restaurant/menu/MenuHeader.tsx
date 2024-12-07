import { ExternalLink, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";

interface MenuHeaderProps {
  menuUrl?: string;
}

const MenuHeader = ({ menuUrl }: MenuHeaderProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState(null);

  // Listen for auth state changes
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return (
    <div className="relative overflow-hidden">
      <div className="bg-background p-6 md:p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-serif text-secondary">Menu</h2>
            <Badge 
              variant="secondary" 
              className="text-xs bg-accent/50 text-secondary/70"
            >
              AI Enhanced
            </Badge>
          </div>
          
          {!session && (
            <div className="max-w-md mx-auto text-center animate-fade-up">
              <Button
                onClick={() => setShowAuthModal(true)}
                className="bg-primary/90 hover:bg-primary text-white px-6 py-2 rounded-lg
                  transition-all duration-300 hover:scale-105"
              >
                <Lock className="w-4 h-4 mr-2" />
                Sign in to See Menu Match Score
              </Button>
            </div>
          )}

          {menuUrl && (
            <div className="text-xs text-muted-foreground mt-2">
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
              >
                <span>View full menu</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
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