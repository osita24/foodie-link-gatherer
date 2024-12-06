import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";
import { MenuCategory } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuSectionProps {
  menu?: MenuCategory[];
  photos?: string[];
  reviews?: any[];
}

const MenuSection = ({ menu, photos, reviews }: MenuSectionProps) => {
  const [processedMenu, setProcessedMenu] = useState<MenuCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (menu) {
      console.log("Using provided menu data:", menu);
      setProcessedMenu(menu);
    } else if (photos?.length || reviews?.length) {
      console.log("No menu provided, processing available data:", {
        photos: photos?.length || 0,
        reviews: reviews?.length || 0
      });
      processRestaurantData();
    } else {
      console.log("No data available to process");
    }
  }, [menu, photos, reviews]);

  const processRestaurantData = async () => {
    setIsProcessing(true);
    try {
      console.log("Starting restaurant data processing");
      
      const { data, error } = await supabase.functions.invoke('menu-processor', {
        body: { 
          photos,
          reviews
        }
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
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-6 h-6" />
            Processing Menu...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Analyzing menu photos...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!processedMenu || processedMenu.length === 0) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-6 h-6" />
            Menu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Menu information is not available at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="w-6 h-6" />
          Menu Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {processedMenu[0].items.map((item) => (
            <li 
              key={item.id}
              className="text-lg font-medium"
            >
              {item.name}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default MenuSection;