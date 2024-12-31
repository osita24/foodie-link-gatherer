import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log("📍 Current location when opening auth:", location.pathname);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
          redirectTo={`${window.location.origin}/onboarding`}
          onlyThirdPartyProviders
          view="sign_in"
          theme="light"
          showLinks={false}
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Password",
              },
            },
          }}
          {...{
            // Using spread operator to handle auth state changes
            onAuthSuccess: ({ session }) => {
              console.log("🎉 Auth success, session:", session?.user?.id);
              onOpenChange(false);
              navigate("/onboarding", { 
                state: { returnUrl: location.pathname } 
              });
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;