import { Button } from "@/components/ui/button";
import { NavigationItems } from "./NavigationItems";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";

interface DesktopNavProps {
  session: any;
  onAuthClick: () => void;
  onSignOutClick: () => void;
  isActive: (path: string) => boolean;
}

const DesktopNav = ({ session, onAuthClick, onSignOutClick, isActive }: DesktopNavProps) => {
  const navigate = useNavigate();
  const { userName } = useProfile();
  const navigationItems = NavigationItems();

  return (
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
                console.log("🔒 Protected route accessed without session, showing auth modal");
                onAuthClick();
                return;
              }
              console.log(`🔄 Navigating to ${item.path}`);
              navigate(item.path);
            }}
          >
            <Icon className="h-4 w-4" />
            {item.isProfile && session ? userName : item.label}
          </Button>
        );
      })}
      
      {!session ? (
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
          onClick={onAuthClick}
        >
          Get Started
        </Button>
      ) : (
        <Button 
          variant="outline"
          onClick={onSignOutClick}
          className="border-gray-200 hover:bg-gray-50"
        >
          Sign out
        </Button>
      )}
    </nav>
  );
};

export default DesktopNav;