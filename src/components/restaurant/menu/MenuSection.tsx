import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuItem from "./MenuItem";
import { supabase } from "@/integrations/supabase/client";

interface MenuSectionProps {
  menu?: any[];
  photos?: string[];
  reviews?: any[];
  menuUrl?: string;
}

const MenuSection = ({ menu = [] }: MenuSectionProps) => {
  const [userPreferences, setUserPreferences] = useState<any>(null);

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

  const getItemMatchDetails = (item: any) => {
    if (!userPreferences) return { score: 50 };

    const itemName = item.name.toLowerCase();
    const description = item.description?.toLowerCase() || '';
    const content = `${itemName} ${description}`;

    // Check for favorite proteins
    const hasPreferredProtein = userPreferences.favorite_proteins?.some(
      (protein: string) => content.includes(protein.toLowerCase())
    );
    if (hasPreferredProtein) {
      return {
        score: 95,
        reason: "Contains your favorite protein!"
      };
    }

    // Check for dietary restrictions
    const hasDietaryRestriction = userPreferences.dietary_restrictions?.some(
      (restriction: string) => content.includes(restriction.toLowerCase())
    );
    if (hasDietaryRestriction) {
      return {
        score: 20,
        warning: "Contains ingredients you avoid"
      };
    }

    // Check for cuisine preferences
    const hasFavoriteCuisine = userPreferences.cuisine_preferences?.some(
      (cuisine: string) => content.includes(cuisine.toLowerCase())
    );
    if (hasFavoriteCuisine) {
      return {
        score: 90,
        reason: "Matches your favorite cuisine!"
      };
    }

    // Check for foods to avoid
    const hasAllergen = userPreferences.favorite_ingredients?.some(
      (ingredient: string) => content.includes(ingredient.toLowerCase())
    );
    if (hasAllergen) {
      return {
        score: 20,
        warning: "Contains ingredients you prefer to avoid"
      };
    }

    // Default score if no strong matches/mismatches
    return { score: 50 };
  };

  // Group menu items by category
  const menuByCategory = menu.reduce((acc: any, item: any) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

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
                matchDetails={getItemMatchDetails(item)}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MenuSection;