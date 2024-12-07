import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { List, Loader2, Star } from "lucide-react";
import { MenuCategory } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MenuSectionProps {
  menu?: MenuCategory[];
  photos?: string[];
  reviews?: any[];
  menuUrl?: string;
}

const MenuSection = ({ menu, photos, reviews, menuUrl }: MenuSectionProps) => {
  const [processedMenu, setProcessedMenu] = useState<MenuCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to generate a random match score (70-100)
  const generateMatchScore = () => Math.floor(Math.random() * 31) + 70;

  // Randomly assign match scores to ~30% of items
  const shouldShowMatchScore = () => Math.random() < 0.3;

  useEffect(() => {
    if (menu) {
      console.log("Using provided menu data:", menu);
      setProcessedMenu(menu);
    } else if (menuUrl) {
      console.log("Menu URL available, attempting to scrape:", menuUrl);
      processMenuUrl();
    } else if (photos?.length || reviews?.length) {
      console.log("No menu provided, processing available data:", {
        photos: photos?.length || 0,
        reviews: reviews?.length || 0
      });
      processRestaurantData();
    } else {
      console.log("No data available to process");
    }
  }, [menu, photos, reviews, menuUrl]);

  const processMenuUrl = async () => {
    setIsProcessing(true);
    try {
      console.log("Starting menu URL processing");
      
      const { data, error } = await supabase.functions.invoke('menu-scraper', {
        body: { menuUrl }
      });

      if (error) {
        console.error("Error processing menu URL:", error);
        throw error;
      }

      console.log("Response from menu scraper:", data);
      
      if (!data?.menuSections?.length) {
        console.log("No menu sections generated from URL");
        throw new Error("Could not extract menu information");
      }

      console.log("Menu sections generated:", data.menuSections);
      setProcessedMenu(data.menuSections);
      toast.success(`Found ${data.menuSections[0].items.length} menu items`);
      
    } catch (error) {
      console.error("Error processing menu URL:", error);
      toast.error("Failed to extract menu information");
      // Fallback to photo/review processing
      if (photos?.length || reviews?.length) {
        processRestaurantData();
      }
    } finally {
      setIsProcessing(false);
    }
  };

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
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="w-6 h-6 text-primary animate-spin mb-3" />
          <p className="text-secondary text-base font-medium">
            Processing Menu...
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Analyzing photos to create your digital menu
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!processedMenu || processedMenu.length === 0) {
    return (
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px]">
          <List className="w-6 h-6 text-muted-foreground mb-3" />
          <p className="text-secondary text-base font-medium">
            Menu Not Available
          </p>
          <p className="text-muted-foreground text-sm mt-1">
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
          <div className="bg-primary/5 p-6 text-center border-b border-primary/10">
            <h2 className="text-xl md:text-2xl font-serif text-secondary">
              Our Menu
            </h2>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          </div>
          
          {/* Menu items */}
          <div className="p-4 md:p-6 space-y-4">
            <div className="grid gap-3">
              {processedMenu[0].items.map((item, index) => {
                const showMatchScore = shouldShowMatchScore();
                const matchScore = showMatchScore ? generateMatchScore() : null;

                return (
                  <div
                    key={item.id}
                    className="group relative p-3 rounded-lg hover:bg-accent/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-medium text-secondary group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          {matchScore && (
                            <Badge 
                              variant="secondary"
                              className={cn(
                                "text-xs font-normal",
                                matchScore >= 90 ? "bg-green-100 text-green-800" :
                                matchScore >= 80 ? "bg-blue-100 text-blue-800" :
                                "bg-orange-100 text-orange-800"
                              )}
                            >
                              <Star className="w-3 h-3 mr-1 inline-block fill-current" />
                              {matchScore}% match
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.price && (
                        <span className="text-sm font-medium text-primary whitespace-nowrap">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {/* Decorative line */}
                    <div className="absolute bottom-0 left-3 right-3 h-px bg-accent/50 transform origin-left transition-transform duration-300 group-hover:scale-x-100" />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Decorative footer */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuSection;