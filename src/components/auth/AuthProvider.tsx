import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";

type AuthContextType = {
  session: any;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ session: null, isLoading: true });

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        console.log("🔍 Getting initial session");
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ Error getting session:", error);
          return;
        }
        
        if (mounted) {
          console.log("✅ Initial session:", session?.user?.id);
          setSession(session);
          
          if (session?.user) {
            console.log("👤 User authenticated, checking preferences");
            const { data: preferences, error: prefError } = await supabase
              .from('user_preferences')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (prefError) {
              console.error("❌ Error fetching preferences:", prefError);
              return;
            }

            if (!preferences && location.pathname !== '/onboarding') {
              console.log("⚠️ No preferences found, redirecting to onboarding");
              localStorage.setItem('redirectAfterOnboarding', location.pathname);
              navigate('/onboarding');
            }
          }
        }
      } catch (error) {
        console.error("❌ Error in getInitialSession:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      console.log('🔄 Auth state changed:', _event, session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error("❌ Error fetching preferences:", error);
          return;
        }

        if (!preferences && location.pathname !== '/onboarding') {
          console.log("⚠️ No preferences found, redirecting to onboarding");
          localStorage.setItem('redirectAfterOnboarding', location.pathname);
          navigate('/onboarding');
        }
      }
    });

    return () => {
      console.log("🧹 Cleaning up auth state change listener");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};