import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import AuthModal from "./auth/AuthModal";
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

const Header = () => {
  console.log("🎯 Header component rendering");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const session = useSession();
  const supabase = useSupabaseClient();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔄 Setting up auth state change listener");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("🔐 Auth state changed:", event, currentSession?.user?.id);
      
      if (event === 'SIGNED_IN') {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });
      }
    });

    return () => {
      console.log("♻️ Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      console.log('🔄 Signing out...');
      
      // Clear any stored session data first
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
        throw error;
      }
      
      console.log('✅ Successfully signed out');
      setShowSignOutDialog(false);
      navigate('/');
      
      toast({
        title: "Success",
        description: "Successfully signed out",
      });
    } catch (error: any) {
      console.error('❌ Error during sign out:', error);
      
      // Even if there's an error, we want to clear the UI state
      setShowSignOutDialog(false);
      navigate('/');
      
      toast({
        title: "Signed out",
        description: "You have been signed out of your account",
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