import { Auth } from "@supabase/auth-ui-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_in");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) return;

      // Check if user has preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session?.user.id)
        .maybeSingle();

      onOpenChange(false);
      
      // If no preferences exist, redirect to onboarding
      if (!preferences) {
        navigate('/onboarding');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Auth
          supabaseClient={supabase}
          view={view}
          appearance={{
            theme: 'default',
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
              button: 'w-full bg-primary text-primary-foreground hover:bg-primary/90',
              input: 'rounded-md',
            }
          }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
              },
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;