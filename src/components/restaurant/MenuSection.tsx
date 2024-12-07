import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { List, Loader2, Sparkles, ExternalLink, Star } from "lucide-react";
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
      console.log("Starting menu processing");
      
      const { data, error } = await supabase.functions.invoke('menu-processor', {
        body: { 
          menuUrl,
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

  // Placeholder function for recommendation score (to be implemented with real user preferences later)
  const getRecommendationScore = (item: any) => {
    // Placeholder logic - returns a random score between 70 and 100
    return Math.floor(Math.random() * 31) + 70;
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
            Analyzing available information to create your digital menu
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
          {/* Menu header */}
          <div className="bg-primary/5 p-6 text-center border-b border-primary/10">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-serif text-secondary">Menu</h2>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-accent/50 text-secondary/70 hover:bg-accent/70"
                >
                  <Sparkles className="w-3 h-3 mr-1 inline-block" />
                  AI Enhanced Beta
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Menu information is automatically processed and continuously improving
              </p>
              {menuUrl && (
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
                >
                  <span>View full menu</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          
          {/* Menu items */}
          <div className="p-4 md:p-6 space-y-4">
            <div className="grid gap-3">
              {processedMenu[0].items.map((item, index) => {
                const recommendationScore = getRecommendationScore(item);
                return (
                  <div
                    key={item.id}
                    className="group relative p-3 rounded-lg hover:bg-accent/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium text-secondary group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          {recommendationScore >= 90 && (
                            <Badge 
                              className="bg-green-100 text-green-800 text-xs px-2 py-0.5"
                            >
                              <Star className="w-3 h-3 mr-1 inline-block fill-current" />
                              Top Pick
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-sm text-muted-foreground leading-snug">
                            {item.description}
                          </p>
                        )}
                        {item.category && (
                          <Badge 
                            variant="outline" 
                            className="mt-1.5 text-xs bg-transparent border-primary/20 text-primary/70"
                          >
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {item.price > 0 && (
                          <span className="text-base font-medium text-primary whitespace-nowrap">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                        {recommendationScore > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  recommendationScore >= 90 ? "bg-green-500" :
                                  recommendationScore >= 80 ? "bg-primary" :
                                  "bg-primary/60"
                                )}
                                style={{ width: `${recommendationScore}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {recommendationScore}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuSection;