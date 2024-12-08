import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import AuthForm from "./AuthForm";
import AuthHeader from "./AuthHeader";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    console.log("🔑 Attempting authentication...");

    try {
      let result;
      
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            },
            emailRedirectTo: window.location.origin
          }
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) {
        throw result.error;
      }

      if (isSignUp) {
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      } else {
        toast({
          title: "Success!",
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