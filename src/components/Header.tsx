import { Button } from "@/components/ui/button";
import { Menu, Home, User, BookmarkPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "./auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
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

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [session, setSession] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookmarkPlus, label: 'Saved', path: '/saved', requiresAuth: true },
    { icon: User, label: 'Profile', path: '/profile', requiresAuth: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setShowSignOutDialog(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
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
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`flex items-center gap-2 ${
                      isActive(item.path) ? 'text-primary' : 'text-gray-600'
                    }`}
                    onClick={() => {
                      if (!session && item.requiresAuth) {
                        setShowAuthModal(true);
                      } else {
                        navigate(item.path);
                      }
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
              
              {!session ? (
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
                  onClick={() => setShowAuthModal(true)}
                >
                  Get Started
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => setShowSignOutDialog(true)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Sign out
                </Button>
              )}
            </nav>

            {/* Mobile menu button */}
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

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 md:hidden">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`w-full justify-start gap-2 ${
                      isActive(item.path) ? 'text-primary' : 'text-gray-600'
                    }`}
                    onClick={() => {
                      if (!session && item.requiresAuth) {
                        setShowAuthModal(true);
                      } else {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
              
              {!session ? (
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    setShowSignOutDialog(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Sign out
                </Button>
              )}
            </nav>
          </div>
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