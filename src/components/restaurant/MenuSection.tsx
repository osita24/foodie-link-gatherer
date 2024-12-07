import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { List, Loader2 } from "lucide-react";
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
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-secondary text-lg font-medium">
            Processing Menu...
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Analyzing photos to create your digital menu
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!processedMenu || processedMenu.length === 0) {
    return (
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          <List className="w-8 h-8 text-muted-foreground mb-4" />
          <p className="text-secondary text-lg font-medium">
            Menu Not Available
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            We're working on getting the latest menu information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
      <CardContent className="p-0">
        <div className="relative">
          {/* Decorative header */}
          <div className="bg-primary/10 p-8 text-center border-b border-primary/20">
            <h2 className="text-2xl md:text-3xl font-serif text-secondary">
              Our Menu
            </h2>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          </div>
          
          {/* Menu items */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="grid gap-4 md:gap-6">
              {processedMenu[0].items.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative p-4 rounded-lg hover:bg-accent/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-medium text-secondary group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.price && (
                      <span className="text-lg font-medium text-primary whitespace-nowrap">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {/* Decorative line */}
                  <div className="absolute bottom-0 left-4 right-4 h-px bg-accent/50 transform origin-left transition-transform duration-300 group-hover:scale-x-100" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Decorative footer */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuSection;