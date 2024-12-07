import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "./auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DesktopNav from "./navigation/DesktopNav";
import MobileNav from "./navigation/MobileNav";
import { useAuth } from "./auth/AuthProvider";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('🔄 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ Sign out error:", error);
        throw error;
      }
      
      console.log('✅ Successfully signed out');
      setShowSignOutDialog(false);
      navigate('/');
      
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Successfully signed out",
        });
      }, 100);
    } catch (error: any) {
      console.error('❌ Error signing out:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="fixed w-full top-0 bg-white/80 backdrop-blur-sm z-50 border-b border-accent/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span 
                className="text-2xl font-bold text-primary cursor-pointer font-serif"
                onClick={() => navigate('/')}
              >
                Cilantro
              </span>
            </div>
            
            <DesktopNav 
              session={session}
              onAuthClick={() => setShowAuthModal(true)}
              onSignOutClick={() => setShowSignOutDialog(true)}
              isActive={(path: string) => location.pathname === path}
            />

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary hover:text-primary/80"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <MobileNav 
            session={session}
            onAuthClick={() => {
              setShowAuthModal(true);
              setIsMenuOpen(false);
            }}
            onSignOutClick={() => {
              setShowSignOutDialog(true);
              setIsMenuOpen(false);
            }}
            isActive={(path: string) => location.pathname === path}
            onClose={() => setIsMenuOpen(false)}
          />
        )}
      </header>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your saved restaurants and personalized recommendations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Header;