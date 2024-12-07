import { Auth } from "@supabase/auth-ui-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { toast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔐 Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.id);
      
      if (session?.user) {
        console.log("✅ User authenticated, checking for preferences");

        try {
          const { data: preferences, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error("❌ Error fetching preferences:", error);
            throw error;
          }

          console.log("📋 User preferences:", preferences);
          onOpenChange(false);
          
          if (!preferences) {
            console.log("⚠️ No preferences found, redirecting to onboarding");
            navigate('/onboarding');
          }
        } catch (error: any) {
          console.error("❌ Error in auth flow:", error);
          toast({
            title: "Error",
            description: "There was a problem with authentication. Please try again.",
            variant: "destructive",
          });
        }
      }
    });

    return () => {
      console.log("🧹 Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, [navigate, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 bg-background">
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="inline-block p-3 bg-primary/10 rounded-full mb-3">
              <svg 
                className="w-6 h-6 text-primary"
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
            <h2 className="text-xl font-semibold text-secondary">
              Welcome to Cilantro
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in or create an account to get personalized restaurant recommendations
            </p>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4A6741',
                    brandAccent: '#2C3B29',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#E8EDE7',
                    defaultButtonBackgroundHover: '#D8DED7',
                    inputBackground: 'white',
                    inputBorder: '#E2E8F0',
                    inputBorderHover: '#4A6741',
                    inputBorderFocus: '#4A6741',
                  }
                }
              },
              className: {
                container: 'w-full',
                button: 'w-full bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg py-2.5',
                input: 'rounded-lg border-gray-200 focus:ring-primary',
                label: 'text-secondary font-medium',
                message: 'text-red-500 text-sm',
                anchor: 'text-primary hover:text-primary/80 transition-colors',
              }
            }}
            providers={[]}
            magicLink={false}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign in to your account',
                  link_text: "Don't have an account? Create one",
                  email_input_placeholder: 'Enter your email',
                  password_input_placeholder: 'Enter your password',
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create password',
                  button_label: 'Create your account',
                  link_text: "Already have an account? Sign in",
                  email_input_placeholder: 'Enter your email',
                  password_input_placeholder: 'Create a secure password',
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