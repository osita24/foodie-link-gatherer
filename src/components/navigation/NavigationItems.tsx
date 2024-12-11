import { Home, BookmarkPlus, User, Circle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const NavigationItems = () => {
  const [completionPercentage, setCompletionPercentage] = useState(100);
  const { session } = useProfile();

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!session?.user?.id) return;

      try {
        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking profile completion:', error);
          return;
        }

        // If no preferences exist yet, show the indicator
        if (!preferences) {
          setCompletionPercentage(0);
          return;
        }

        let completed = 0;
        let total = 5;

        if (preferences.cuisine_preferences?.length > 0) completed++;
        if (preferences.dietary_restrictions?.length > 0) completed++;
        if (preferences.favorite_ingredients?.length > 0) completed++;
        if (preferences.atmosphere_preferences?.length > 0) completed++;
        if (preferences.favorite_proteins?.length > 0) completed++;

        setCompletionPercentage((completed / total) * 100);
      } catch (error) {
        console.error('Error checking profile completion:', error);
      }
    };

    checkProfileCompletion();
  }, [session?.user?.id]);

  return [
    { 
      icon: Home, 
      label: 'Home', 
      path: '/' 
    },
    { 
      icon: BookmarkPlus, 
      label: 'Saved', 
      path: '/saved', 
      requiresAuth: true 
    },
    { 
      icon: ({ className }: { className?: string }) => (
        <div className="relative">
          <User className={className} />
          {session?.user && completionPercentage < 100 && (
            <div className="absolute -top-1 -right-1">
              <div className="w-1.5 h-1.5 bg-green-500/70 rounded-full transition-all duration-300 hover:scale-110" />
            </div>
          )}
        </div>
      ),
      label: 'Profile', 
      path: '/profile', 
      requiresAuth: true, 
      isProfile: true 
    },
  ];
};