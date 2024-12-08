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
import { Star, ChevronDown } from "lucide-react";

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
  const { itemMatchDetails, analyzedMenu, topMatch } = useMenuAnalysis(processedMenu);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    console.log("🔍 Initializing MenuSection with restaurant:", restaurant?.name);
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🔐 Auth session loaded:", session?.user?.id);
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 Auth state changed:", session?.user?.id);
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (menu) {
      console.log("📋 Using provided menu data:", menu);
      setProcessedMenu(menu);
    } else if (menuUrl || photos?.length || reviews?.length) {
      console.log("🔄 Processing available data sources");
      processRestaurantData();
    }
  }, [menu, photos, reviews, menuUrl]);

  const processRestaurantData = async () => {
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
  };

  if (isProcessing) return <MenuLoadingState isProcessing />;
  if (!processedMenu || processedMenu.length === 0) return <MenuLoadingState />;

  const menuToDisplay = session ? (analyzedMenu || processedMenu) : processedMenu;

  return (
    <div className="space-y-6">
      {session && topMatch && (
        <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                  Top Match
                  <span className="text-sm font-normal text-muted-foreground">
                    ({topMatch.analysis.score}% match)
                  </span>
                </h3>
                <p className="text-base font-medium mt-1">{topMatch.name}</p>
                {topMatch.description && (
                  <p className="text-sm text-muted-foreground mt-1">{topMatch.description}</p>
                )}
                <p className="text-sm text-primary mt-2">
                  {topMatch.analysis.reason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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