import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const navigate = useNavigate();

  console.log("🔐 Rendering AuthModal");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogTitle className="text-center text-xl font-semibold mb-4">
          Welcome to Cilantro
        </DialogTitle>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--primary))',
                  brandAccent: 'rgb(var(--primary))',
                }
              }
            },
            className: {
              container: 'w-full',
              button: 'w-full bg-primary text-white hover:bg-primary/90',
              input: 'rounded-md',
            }
          }}
          providers={['google']}
          redirectTo={window.location.origin}
          onlyThirdPartyProviders={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;