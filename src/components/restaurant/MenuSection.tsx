import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";
import { MenuCategory } from "@/types/restaurant";
import MenuUploader from "./menu/MenuUploader";

interface MenuSectionProps {
  menu?: MenuCategory[];
  photos?: string[];
  reviews?: any[];
  restaurantId: string;
}

const MenuSection = ({ menu, photos, reviews, restaurantId }: MenuSectionProps) => {
  const [processedMenu, setProcessedMenu] = useState<MenuCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (menu) {
      console.log("Using provided menu data:", menu);
      setProcessedMenu(menu);
    }
  }, [menu]);

  const handleUploadComplete = (menuData: any) => {
    console.log("Menu upload complete, updating menu data:", menuData);
    if (menuData?.menuSections?.length) {
      setProcessedMenu(menuData.menuSections);
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
            Analyzing menu...
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
          Menu
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(!processedMenu || processedMenu.length === 0) ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center">
              Help others by adding the menu
            </p>
            <MenuUploader 
              restaurantId={restaurantId} 
              onUploadComplete={handleUploadComplete}
            />
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default MenuSection;