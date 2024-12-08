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
  const { categories } = useRestaurantMatch(restaurant);
  const { itemMatchDetails, analyzedMenu } = useMenuAnalysis(processedMenu);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (menu) {
      console.log("Using provided menu data:", menu);
      setProcessedMenu(menu);
    } else if (menuUrl || photos?.length || reviews?.length) {
      console.log("Processing available data:", {
        menuUrl: menuUrl || 'none',
        photos: photos?.length || 0,
        reviews: reviews?.length || 0
      });
      processRestaurantData();
    } else {
      console.log("No data available to process");
    }
  }, [menu, photos, reviews, menuUrl]);

  const processRestaurantData = async () => {
    setIsProcessing(true);
    try {
      console.log("Starting menu processing with data:", {
        menuUrl,
        photosCount: photos?.length,
        reviewsCount: reviews?.length
      });
      
      // Validate and prepare the request payload
      const payload = {
        menuUrl: menuUrl || null,
        photos: photos || [],
        reviews: reviews?.map(review => ({
          text: review.text || '',
          rating: review.rating || 0
        })) || []
      };

      console.log("Sending payload to menu processor:", payload);
      
      const { data, error } = await supabase.functions.invoke('menu-processor', {
        body: payload
      });

      if (error) {
        console.error("Error processing data:", error);
        throw error;
      }

      console.log("Response from menu processor:", data);
      
      if (!data?.menuSections?.length) {
        console.log("No menu sections generated");
        toast.info("Could not generate menu information");
        return;
      }

      console.log("Menu sections generated:", data.menuSections);
      setProcessedMenu(data.menuSections);
      toast.success(`Found ${data.menuSections[0].items.length} menu items`);
      
    } catch (error) {
      console.error("Error processing restaurant data:", error);
      toast.error("Failed to generate menu information");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <MenuLoadingState isProcessing />;
  }

  if (!processedMenu || processedMenu.length === 0) {
    return <MenuLoadingState />;
  }

  const menuToDisplay = session ? (analyzedMenu || processedMenu) : processedMenu;

  return (
    <div className="space-y-6">
      {session && restaurant && <MatchScoreCard restaurant={restaurant} />}
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