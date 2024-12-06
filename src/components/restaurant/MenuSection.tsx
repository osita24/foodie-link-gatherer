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
      setProcessedMenu(menu);
    } else if (photos?.length) {
      processMenuPhotos();
    }
  }, [menu, photos]);

  const processMenuPhotos = async () => {
    if (!photos?.length) return;

    setIsProcessing(true);
    try {
      console.log("Processing menu photos:", photos);
      
      // Process each photo that might contain menu information
      const menuPromises = photos.map(async (photoUrl) => {
        const { data, error } = await supabase.functions.invoke('menu-processor', {
          body: { imageUrl: photoUrl }
        });

        if (error) throw error;
        return data.menuSections;
      });

      const results = await Promise.all(menuPromises);
      
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

      console.log("Processed menu:", combinedMenu);
      setProcessedMenu(combinedMenu);
      
    } catch (error) {
      console.error("Error processing menu photos:", error);
      toast.error("Failed to process menu photos");
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
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCategory?.items.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MenuSection;