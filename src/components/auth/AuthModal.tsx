import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { BookmarkPlus, Sparkles, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  console.log("Rendering AuthModal with open:", open);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in successfully");
        toast.success("Successfully signed in!");
        onOpenChange(false);
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        toast.info("Signed out successfully");
      } else if (event === 'USER_UPDATED') {
        console.log("User profile updated");
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery event received");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed");
      }

      // Clear any previous errors when auth state changes
      setAuthError(null);
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [onOpenChange]);

  // Reset error when modal is opened/closed
  useEffect(() => {
    setAuthError(null);
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-4">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-semibold">Join FindDine</DialogTitle>
          <DialogDescription className="text-sm">
            Create your free account to unlock all features
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <BookmarkPlus className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">Save Your Favorites</p>
                <p className="text-gray-600">Keep track of restaurants you love</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">Personalized Recommendations</p>
                <p className="text-gray-600">Get suggestions based on your taste</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <UserCircle className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">Custom Profile</p>
                <p className="text-gray-600">Set your dining preferences</p>
              </div>
            </div>
          </div>
        </div>

        {authError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{authError}</p>
          </div>
        )}

        <div className="mt-2">
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
                  height: '40px',
                },
                container: {
                  gap: '12px',
                },
                message: {
                  color: 'red',
                },
              },
            }}
            providers={['google']}
            redirectTo={window.location.origin}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                },
              },
            }}
            view="sign_in"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;