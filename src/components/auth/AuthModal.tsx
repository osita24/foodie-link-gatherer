import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import AuthForm from "./AuthForm";
import AuthHeader from "./AuthHeader";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("🔑 Attempting authentication...");

    try {
      let result;
      
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (result.error) {
          if (result.error.message.includes("password")) {
            throw new Error("Password must be at least 6 characters long");
          } else if (result.error.message.includes("email")) {
            throw new Error("Please enter a valid email address");
          }
          throw result.error;
        }

        // If signup is successful, redirect to onboarding
        if (result.data.user) {
          console.log("✅ Signup successful, redirecting to onboarding...");
          toast({
            title: "Welcome to Cilantro!",
            description: "Let's set up your preferences.",
          });
          onOpenChange(false);
          navigate('/onboarding');
          return;
        }
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (result.error) {
          if (result.error.message.includes("Invalid login credentials")) {
            throw new Error("Incorrect email or password");
          }
          throw result.error;
        }

        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        onOpenChange(false);
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
        <DialogTitle className="sr-only">Authentication</DialogTitle>
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