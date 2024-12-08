import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { List, Loader2 } from "lucide-react";
import { MenuCategory } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MenuItem from "./menu/MenuItem";
import MenuHeader from "./menu/MenuHeader";
import MatchScoreCard from "./MatchScoreCard";
import { useRestaurantMatch } from "@/hooks/useRestaurantMatch";

interface MenuSectionProps {
  menu?: MenuCategory[];
  photos?: string[];
  reviews?: any[];
  menuUrl?: string;
}

const MenuSection = ({ menu, photos, reviews, menuUrl }: MenuSectionProps) => {
  const [processedMenu, setProcessedMenu] = useState<MenuCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const { categories } = useRestaurantMatch(null);

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
      const { data, error } = await supabase.functions.invoke('menu-processor', {
        body: { menuUrl, photos, reviews }
      });
      
      if (error) {
        console.error('Error processing menu:', error);
        throw error;
      }
      
      console.log('Processed menu data:', data);
      setProcessedMenu(data.menuSections || []);
    } catch (error) {
      console.error('Error processing menu:', error);
      toast.error("Failed to process menu data");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <List className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Menu</h2>
              <p className="text-sm text-gray-500">
                Browse through the menu items and see personalized recommendations
              </p>
            </div>
          </div>
          
          <div className="mt-6 space-y-6">
            {processedMenu.map((category, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-lg font-medium">{category.name}</h3>
                <div className="grid gap-4">
                  {category.items.map((item) => (
                    <MenuItem 
                      key={item.id} 
                      item={item}
                      matchDetails={itemMatchDetails[item.id] || { score: 50 }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuSection;