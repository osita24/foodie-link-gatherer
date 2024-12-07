import { Home, BookmarkIcon, UserCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    {
      icon: Home,
      label: "Home",
      href: "/",
    },
    {
      icon: BookmarkIcon,
      label: "Saved",
      href: "/saved",
      requiresAuth: true,
    },
    {
      icon: UserCircle,
      label: "Profile",
      href: "/profile",
      requiresAuth: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t md:relative md:border-t-0 md:border-r md:w-64 md:min-h-screen z-40">
      <div className="flex md:flex-col md:pt-20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const showAuthPrompt = item.requiresAuth && !isAuthenticated;

          return (
            <Link
              key={item.href}
              to={showAuthPrompt ? "/" : item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 flex-1 md:flex-none transition-colors",
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-gray-600 hover:text-primary hover:bg-primary/5",
                showAuthPrompt && "opacity-50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;