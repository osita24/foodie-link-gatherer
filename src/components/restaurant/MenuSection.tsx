import { useState, useEffect, useCallback, useMemo } from "react";
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
  const { categories } = useRestaurantMatch(restaurant);
  const { itemMatchDetails, analyzedMenu } = useMenuAnalysis(processedMenu);
  const [session, setSession] = useState<any>(null);
  const [topMatchId, setTopMatchId] = useState<string | null>(null);

  // Memoize the auth subscription to prevent unnecessary re-renders
  const setupAuthSubscription = useCallback(() => {
    console.log("🔍 Setting up auth subscription");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 Auth state changed:", session?.user?.id);
      setSession(session);
    });

    return () => {
      console.log("🧹 Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("🔍 Initializing MenuSection with restaurant:", restaurant?.name);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🔐 Initial auth session loaded:", session?.user?.id);
      setSession(session);
    });

    return setupAuthSubscription();
  }, [setupAuthSubscription]);

  // Memoize the menu processing logic
  const processRestaurantData = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const payload = {
        menuUrl: menuUrl || null,
        photos: photos || [],
        reviews: reviews?.map(review => ({
          text: review.text || '',
          rating: review.rating || 0
        })) || []
      };

      console.log("📤 Sending payload to menu processor:", payload);
      
      const { data, error } = await supabase.functions.invoke('menu-processor', {
        body: payload
      });

      if (error) throw error;

      if (!data?.menuSections?.length) {
        console.log("⚠️ No menu sections generated");
        toast.info("Could not generate menu information");
        return;
      }

      console.log("✅ Menu sections generated:", data.menuSections);
      setProcessedMenu(data.menuSections);
      toast.success(`Found ${data.menuSections[0].items.length} menu items`);
      
    } catch (error) {
      console.error("❌ Error processing restaurant data:", error);
      toast.error("Failed to generate menu information");
    } finally {
      setIsProcessing(false);
    }
  }, [menuUrl, photos, reviews, isProcessing]);

  useEffect(() => {
    if (menu) {
      console.log("📋 Using provided menu data:", menu);
      setProcessedMenu(menu);
    } else if (menuUrl || photos?.length || reviews?.length) {
      console.log("🔄 Processing available data sources");
      processRestaurantData();
    }
  }, [menu, processRestaurantData]);

  // Memoize the top match calculation
  useEffect(() => {
    if (session && itemMatchDetails) {
      const scores = Object.entries(itemMatchDetails)
        .map(([id, details]) => ({
          id,
          score: details.score || 0
        }))
        .sort((a, b) => b.score - a.score);
      
      const topMatch = scores[0];
      setTopMatchId(topMatch?.id || null);
      console.log("🏆 Top match identified:", topMatch);
    }
  }, [itemMatchDetails, session]);

  const menuToDisplay = useMemo(() => 
    session ? (analyzedMenu || processedMenu) : processedMenu,
    [session, analyzedMenu, processedMenu]
  );

  if (isProcessing) return <MenuLoadingState isProcessing />;
  if (!processedMenu || processedMenu.length === 0) return <MenuLoadingState />;

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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