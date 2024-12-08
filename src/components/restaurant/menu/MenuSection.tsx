import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuItem from "./MenuItem";
import { useRestaurantMatch } from "@/hooks/useRestaurantMatch";
import { supabase } from "@/integrations/supabase/client";

interface MenuSectionProps {
  menu?: any[];
  photos?: string[];
  reviews?: any[];
  menuUrl?: string;
}

const MenuSection = ({ menu = [] }: MenuSectionProps) => {
  const [userPreferences, setUserPreferences] = useState<any>(null);

  // Fetch user preferences
  const loadUserPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setUserPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  useState(() => {
    loadUserPreferences();
  }, []);

  const getItemRecommendation = (item: any) => {
    if (!userPreferences) return { score: 50, matchReason: null, avoidReason: null };

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
        matchReason: `Contains your favorite protein!`,
        avoidReason: null
      };
    }

    // Check for foods to avoid
    const hasAllergen = userPreferences.favorite_ingredients?.some(
      (ingredient: string) => content.includes(ingredient.toLowerCase())
    );
    if (hasAllergen) {
      return {
        score: 20,
        matchReason: null,
        avoidReason: `Contains ingredients you prefer to avoid`
      };
    }

    // Default score if no strong matches/mismatches
    return { score: 50, matchReason: null, avoidReason: null };
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
            {items.map((item: any) => {
              const { score, matchReason, avoidReason } = getItemRecommendation(item);
              return (
                <MenuItem
                  key={item.id}
                  item={item}
                  recommendationScore={score}
                  matchReason={matchReason}
                  avoidReason={avoidReason}
                />
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MenuSection;