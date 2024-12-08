import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuItem from "./menu/MenuItem";
import { supabase } from "@/integrations/supabase/client";

interface MenuSectionProps {
  menu?: any[];
  photos?: string[];
  reviews?: any[];
  menuUrl?: string;
  restaurant?: {
    name: string;
    cuisine?: string;
    priceLevel?: number;
    rating?: number;
    servesVegetarianFood?: boolean;
    types?: string[];
  };
}

const MenuSection = ({ menu = [], restaurant }: MenuSectionProps) => {
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        console.log("Loaded user preferences:", data);
        setUserPreferences(data);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadUserPreferences();
  }, []);

  // Group menu items by category
  const menuByCategory = menu.reduce((acc: any, item: any) => {
    console.log("Processing menu item:", item); // Debug log
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  console.log("Menu by category:", menuByCategory); // Debug log
  console.log("Menu categories:", Object.keys(menuByCategory)); // Debug log

  useEffect(() => {
    const loadMatchDetails = async () => {
      console.log("Starting loadMatchDetails with menu:", menu); // Debug log
      
      if (!menu || menu.length === 0) {
        console.log("No menu items to process");
        return;
      }

      const details: Record<string, any> = {};
      
      // Flatten menu items if they're nested
      const menuItems = menu.flatMap(section => 
        Array.isArray(section.items) ? section.items : [section]
      );

      console.log("Processing menu items:", menuItems); // Debug log

      for (const item of menuItems) {
        try {
          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('*')
            .single();

          if (!preferences) {
            details[item.id] = { score: 75 };
            continue;
          }

          const { data, error } = await supabase.functions.invoke('menu-processor', {
            body: { 
              action: 'analyze-item',
              item,
              preferences,
              restaurant: {
                name: restaurant?.name,
                cuisine: restaurant?.types?.find(t => t.includes('cuisine')),
                priceLevel: restaurant?.priceLevel,
                rating: restaurant?.rating,
                servesVegetarianFood: restaurant?.servesVegetarianFood
              }
            }
          });

          if (error || !data) {
            console.error("Error analyzing item:", error);
            details[item.id] = { score: 75 };
            continue;
          }

          details[item.id] = data;
        } catch (error) {
          console.error("Error getting match details:", error);
          details[item.id] = { score: 75 };
        }
      }

      console.log("Final item match details:", details); // Debug log
      setItemMatchDetails(details);
    };

    loadMatchDetails();
  }, [menu, restaurant]);

  if (!menu || menu.length === 0) {
    console.log("No menu data available");
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
        No menu items available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <Tabs defaultValue={Object.keys(menuByCategory)[0]} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          {Object.keys(menuByCategory).map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="whitespace-nowrap"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(menuByCategory).map(([category, items]: [string, any]) => (
          <TabsContent key={category} value={category} className="p-4 space-y-4">
            {items.map((item: any) => (
              <MenuItem
                key={item.id}
                item={item}
                matchDetails={itemMatchDetails[item.id] || { score: 75 }}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MenuSection;