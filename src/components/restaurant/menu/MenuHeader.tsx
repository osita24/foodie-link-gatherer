import { ExternalLink, Lock, Sparkles, Star } from "lucide-react";
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
      <div className="bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 p-6 md:p-8 text-center">
        <div className="flex flex-col items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-serif text-secondary">Menu</h2>
            <Badge 
              variant="secondary" 
              className="text-xs bg-accent/50 text-secondary/70 hover:bg-accent/70"
            >
              <Sparkles className="w-3 h-3 mr-1 inline-block" />
              AI Enhanced
            </Badge>
          </div>
          
          {!session && (
            <div className="max-w-xl mx-auto space-y-3 animate-fade-up">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-400" />
                <span className="font-medium">Menu Match Score Available</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                See how well this menu matches your taste preferences. Our AI analyzes your dining profile to find your perfect dishes.
              </p>
              <Button
                onClick={() => setShowAuthModal(true)}
                className="mt-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg
                  transition-all duration-300 hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Unlock Menu Match Score
                </span>
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-2">
            Menu information is automatically processed and continuously improving
            {menuUrl && (
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
              >
                <span>View full menu</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
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