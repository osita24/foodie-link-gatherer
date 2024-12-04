import { useState, useEffect } from "react";
import { BookmarkPlus, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";

const ActionButtons = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [session, setSession] = useState(null);

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
      if (session) {
        setShowSignUpDialog(false);
        toast({
          title: "Successfully signed in!",
          description: `Welcome ${session.user.email}`,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!session) {
      console.log("No session, showing sign up dialog");
      setShowSignUpDialog(true);
      return;
    }

    setIsSaving(true);
    // Here you would implement the save functionality
    console.log("Saving with user:", session.user);
    
    toast({
      title: "Restaurant saved!",
      description: "You can find it in your saved restaurants.",
    });
    
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleShare = () => {
    console.log("Share clicked");
    // Implement share functionality
    toast({
      title: "Share feature",
      description: "Coming soon!",
    });
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 flex flex-col sm:flex-row gap-2 z-[100] md:absolute md:bottom-4 md:right-4 md:left-auto">
        <Button
          size="lg"
          className={`bg-primary text-white hover:bg-primary/90 transition-all duration-300 w-full sm:w-auto shadow-lg
            ${isSaving ? 'scale-105 bg-green-500' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Check className="mr-2 h-5 w-5 animate-[scale-in_0.2s_ease-out]" />
          ) : (
            <BookmarkPlus className="mr-2 h-5 w-5" />
          )}
          {isSaving ? 'Saved!' : 'Save'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="bg-white/80 backdrop-blur-sm hover:bg-white w-full sm:w-auto shadow-lg"
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-5 w-5" />
          Share
        </Button>
      </div>

      <Dialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign up to save restaurants</DialogTitle>
            <DialogDescription>
              Create a free account to save your favorite restaurants and access them anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#000000',
                      brandAccent: '#333333',
                    },
                  },
                },
              }}
              providers={['google']}
              onlyThirdPartyProviders
              redirectTo={window.location.origin}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionButtons;