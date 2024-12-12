import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MenuCategory, RestaurantDetails } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MenuItem from "./menu/MenuItem";
import MenuHeader from "./menu/MenuHeader";
import MatchScoreCard from "./MatchScoreCard";
import { useRestaurantMatch } from "@/hooks/useRestaurantMatch";
import { useMenuAnalysis } from "@/hooks/useMenuAnalysis";
import MenuLoadingState from "./menu/MenuLoadingState";

interface MenuSectionProps {
  menu?: MenuCategory[];
  photos?: string[];
  reviews?: any[];
  menuUrl?: string;
  restaurant?: RestaurantDetails;
}

const MenuSection = ({ menu, photos, reviews, menuUrl, restaurant }: MenuSectionProps) => {
  const [processedMenu, setProcessedMenu] = useState<MenuCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { categories } = useRestaurantMatch(restaurant);
  const { itemMatchDetails, analyzedMenu } = useMenuAnalysis(processedMenu);
  const [session, setSession] = useState<any>(null);
  const [topMatchId, setTopMatchId] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔍 Initializing MenuSection with restaurant:", restaurant?.name);
    
    const setupAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      return supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      }).data.subscription;
    };

    const subscription = setupAuth();
    return () => {
      subscription.then(sub => sub.unsubscribe());
    };
  }, []);

  useEffect(() => {
    if (menu) {
      console.log("📋 Using provided menu data");
      setProcessedMenu(menu);
    } else if (menuUrl || photos?.length || reviews?.length) {
      console.log("🔄 Processing available data sources");
      processRestaurantData();
    }
  }, [menu, photos, reviews, menuUrl]);

  useEffect(() => {
    if (session && itemMatchDetails) {
      const scores = Object.entries(itemMatchDetails).map(([id, details]) => ({
        id,
        score: details.score || 0
      }));
      const topMatch = scores.sort((a, b) => b.score - a.score)[0];
      setTopMatchId(topMatch?.id || null);
    }
  }, [itemMatchDetails, session]);

  const processRestaurantData = async () => {
    if (isProcessing) return; // Prevent multiple simultaneous processing attempts
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Optimize payload size
      const payload = {
        menuUrl: menuUrl || null,
        photos: photos?.slice(0, 2) || [], // Reduce to 2 photos max
        reviews: reviews?.slice(0, 3)?.map(review => ({ // Reduce to 3 reviews max
          text: review.text?.slice(0, 200) || '', // Limit review text length
          rating: review.rating || 0
        })) || []
      };

      console.log("📤 Sending optimized payload to menu processor");
      
      const { data, error } = await supabase.functions.invoke('menu-processor', {
        body: payload
      });

      if (error) throw error;

      if (!data?.menuSections?.length) {
        throw new Error("No menu data generated");
      }

      setProcessedMenu(data.menuSections);
      console.log(`✅ Successfully processed ${data.menuSections[0].items.length} menu items`);
      
    } catch (error: any) {
      console.error("❌ Error processing restaurant data:", error);
      setError("Failed to load menu information");
      toast.error("Failed to generate menu information");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) return <MenuLoadingState isProcessing />;
  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={processRestaurantData}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </Card>
    );
  }
  if (!processedMenu || processedMenu.length === 0) return <MenuLoadingState />;

  const menuToDisplay = session ? (analyzedMenu || processedMenu) : processedMenu;

  return (
    <div className="space-y-6">
      {session && restaurant && (
        <div className="animate-fade-in">
          <MatchScoreCard restaurant={restaurant} />
        </div>
      )}
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-0">
          <div className="relative">
            <MenuHeader menuUrl={menuUrl} />
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {menuToDisplay[0].items.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    matchDetails={session ? (itemMatchDetails[item.id] || { score: 50, matchType: 'neutral' }) : null}
                    isTopMatch={session && item.id === topMatchId}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuSection;