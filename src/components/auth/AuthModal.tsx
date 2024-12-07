import { Auth } from "@supabase/auth-ui-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSupa } from '@supabase/auth-ui-shared';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_up");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) return;

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session?.user.id)
        .maybeSingle();

      onOpenChange(false);
      
      if (!preferences) {
        navigate('/onboarding');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block p-3 bg-primary/10 rounded-full mb-2">
              <svg 
                className="w-8 h-8 text-primary"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary">
              Join FindDine Today
            </h2>
            <p className="text-muted-foreground">
              Get personalized restaurant recommendations tailored just for you
            </p>
          </div>

          <div className="grid gap-4 p-4 bg-accent/30 rounded-lg">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-secondary">Smart restaurant matches based on your taste</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-secondary">Save and organize your favorite spots</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-secondary">Personalized menu recommendations</span>
            </div>
          </div>

          <Auth
            supabaseClient={supabase}
            view={view}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#FF9F66',
                    brandAccent: '#FF9F66',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#FDE1D3',
                    defaultButtonBackgroundHover: '#FFD1B3',
                    inputBackground: 'white',
                    inputBorder: '#E2E8F0',
                    inputBorderHover: '#FF9F66',
                    inputBorderFocus: '#FF9F66',
                  }
                }
              },
              className: {
                container: 'w-full',
                button: 'w-full bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg py-2.5',
                input: 'rounded-lg border-gray-200 focus:ring-primary',
                label: 'text-secondary font-medium',
                message: 'text-muted-foreground',
                anchor: 'text-primary hover:text-primary/80 transition-colors',
              }
            }}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  link_text: "Don't have an account? Sign up",
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Create account',
                  link_text: "Already have an account? Sign in",
                },
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;