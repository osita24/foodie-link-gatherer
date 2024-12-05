import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { BookmarkPlus, Sparkles, UserCircle } from "lucide-react";
import { useEffect } from "react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  console.log("Rendering AuthModal with open:", open);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (session) {
        console.log("User is authenticated, closing modal");
        onOpenChange(false);
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [onOpenChange]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Join FindDine</DialogTitle>
          <DialogDescription className="text-center">
            Create your free account to unlock all features
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <BookmarkPlus className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Save Your Favorites</p>
                <p className="text-gray-600">Keep track of restaurants you love</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Personalized Recommendations</p>
                <p className="text-gray-600">Get suggestions based on your taste</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <UserCircle className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Custom Profile</p>
                <p className="text-gray-600">Set your dining preferences</p>
              </div>
            </div>
          </div>
        </div>

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
              style: {
                button: {
                  borderRadius: '6px',
                  height: '44px',
                },
                container: {
                  gap: '16px',
                },
              },
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/profile`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;