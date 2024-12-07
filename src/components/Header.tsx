import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
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

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [session, setSession] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    
    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        // Check if user has preferences
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!preferences) {
          navigate('/onboarding');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Successfully signed out');
      setShowSignOutDialog(false);
      setSession(null);
      navigate('/');
      
      // Add a small delay before showing the success message
      setTimeout(() => {
        toast.success('Successfully signed out');
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <>
      <header className="fixed w-full top-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span 
                className="text-2xl font-bold text-primary cursor-pointer"
                onClick={() => navigate('/')}
              >
                FindDine
              </span>
            </div>
            
            <DesktopNav 
              session={session}
              onAuthClick={() => setShowAuthModal(true)}
              onSignOutClick={() => setShowSignOutDialog(true)}
              isActive={isActive}
            />

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
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
            isActive={isActive}
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