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
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join FindDine Today
          </h2>
          <p className="text-gray-600">
            Get personalized restaurant recommendations based on your preferences
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Personalized restaurant matches</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Save your favorite restaurants</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Get menu recommendations</span>
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
                }
              }
            },
            className: {
              container: 'w-full',
              button: 'w-full bg-primary text-white hover:bg-primary/90',
              input: 'rounded-md',
              label: 'text-gray-700',
              message: 'text-gray-600',
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
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;