import { Button } from "@/components/ui/button";
import { navigationItems } from "./NavigationItems";
import { useNavigate } from "react-router-dom";

interface MobileNavProps {
  session: any;
  onAuthClick: () => void;
  onSignOutClick: () => void;
  isActive: (path: string) => boolean;
  onClose: () => void;
}

const MobileNav = ({ session, onAuthClick, onSignOutClick, isActive, onClose }: MobileNavProps) => {
  const navigate = useNavigate();

  return (
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
                  onAuthClick();
                  onClose();
                  return;
                }
                navigate(item.path);
                onClose();
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
              onAuthClick();
              onClose();
            }}
          >
            Get Started
          </Button>
        ) : (
          <Button 
            variant="outline"
            className="w-full border-gray-200 hover:bg-gray-50"
            onClick={() => {
              onSignOutClick();
              onClose();
            }}
          >
            Sign out
          </Button>
        )}
      </nav>
    </div>
  );
};

export default MobileNav;