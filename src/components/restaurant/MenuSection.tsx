import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { List } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuCategory } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuSectionProps {
  menu?: MenuCategory[];
  photos?: string[];
}

const MenuSection = ({ menu, photos }: MenuSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [processedMenu, setProcessedMenu] = useState<MenuCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (menu) {
      console.log("Using provided menu data:", menu);
      setProcessedMenu(menu);
    } else if (photos?.length) {
      console.log("No menu provided, attempting to process photos:", photos);
      processMenuPhotos();
    } else {
      console.log("No menu data or photos available");
    }
  }, [menu, photos]);

  const processMenuPhotos = async () => {
    if (!photos?.length) {
      console.log("No photos available to process");
      return;
    }

    setIsProcessing(true);
    try {
      console.log("Starting menu photo processing for", photos.length, "photos");
      
      // Process each photo that might contain menu information
      const menuPromises = photos.map(async (photoUrl) => {
        console.log("Sending photo for processing:", photoUrl);
        const { data, error } = await supabase.functions.invoke('menu-processor', {
          body: { imageUrl: photoUrl }
        });

        if (error) {
          console.error("Error processing photo:", error);
          throw error;
        }

        console.log("Response from menu processor:", data);
        if (!data?.menuSections?.length) {
          console.log("No menu sections found in this photo");
          return [];
        }

        console.log("Menu sections extracted from photo:", data.menuSections);
        return data.menuSections;
      });

      const results = await Promise.all(menuPromises);
      console.log("All photo processing results:", results);
      
      // Combine all menu sections
      const combinedMenu = results.flat().map(section => ({
        name: section.name,
        items: section.items.map((item, index) => ({
          id: `${section.name}-${index}`,
          name: item.name,
          description: item.description || "",
          price: parseFloat(item.price?.replace('$', '') || '0'),
          category: section.name
        }))
      }));

      console.log("Final processed menu:", combinedMenu);
      setProcessedMenu(combinedMenu);
      
      if (combinedMenu.length === 0) {
        toast.info("No menu items were found in the photos");
      } else {
        toast.success(`Successfully extracted ${combinedMenu.length} menu sections`);
      }
      
    } catch (error) {
      console.error("Error processing menu photos:", error);
      toast.error("Failed to process menu photos");
    } finally {
      setIsProcessing(false);
    }
  };

  // Log current state for debugging
  console.log("Current component state:", {
    selectedCategory,
    processedMenu,
    isProcessing,
    currentCategory: selectedCategory 
      ? processedMenu.find(cat => cat.name === selectedCategory) 
      : processedMenu[0]
  });

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

  const currentCategory = selectedCategory 
    ? processedMenu.find(cat => cat.name === selectedCategory) 
    : processedMenu[0];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <List className="w-6 h-6" />
            Menu
          </CardTitle>
          {processedMenu.length > 0 && (
            <Select
              value={selectedCategory || processedMenu[0]?.name}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {processedMenu.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {currentCategory?.items?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCategory.items.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No items available in this category.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuSection;