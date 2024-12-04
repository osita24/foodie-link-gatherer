import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join FindDine</DialogTitle>
          <DialogDescription className="space-y-3 pt-3">
            <p>Create a free account to unlock personalized features:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Save your favorite restaurants for quick access</li>
              <li>Get personalized restaurant recommendations</li>
              <li>Receive updates about new restaurants matching your taste</li>
              <li>Create custom dining lists and collections</li>
            </ul>
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
  );
};

export default AuthModal;