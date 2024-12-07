import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import AuthForm from "./AuthForm";
import AuthHeader from "./AuthHeader";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("🔐 Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        console.log("✅ User signed in successfully");
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
            // Store current path before redirecting
            localStorage.setItem('redirectAfterOnboarding', location.pathname);
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
  }, [navigate, onOpenChange, location]);

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              redirect_to: location.pathname
            }
          }
        });
        
        if (result.error) {
          if (result.error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
            setIsSignUp(false);
          } else {
            throw result.error;
          }
        } else {
          toast({
            title: "Success!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (result.error) {
          throw result.error;
        }
      }
    } catch (error: any) {
      console.error("❌ Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 bg-background">
        <div className="p-6 space-y-6">
          <AuthHeader isSignUp={isSignUp} />
          <AuthForm 
            isSignUp={isSignUp}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onToggleMode={() => setIsSignUp(!isSignUp)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;