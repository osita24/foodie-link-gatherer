import { useState, useEffect } from 'react';
import { MenuCategory } from "@/types/restaurant";
import { calculateMenuItemScore } from '@/utils/menu/scoreCalculator';
import { resolveMatchType } from '@/utils/menu/matchTypeResolver';
import { supabase } from "@/integrations/supabase/client";

export const useMenuAnalysis = (processedMenu: MenuCategory[] | null) => {
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const [analyzedMenu, setAnalyzedMenu] = useState<MenuCategory[] | null>(null);

  useEffect(() => {
    const analyzeMenu = async () => {
      if (!processedMenu?.[0]?.items) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      console.log("Loading preferences for user:", user.id);
      
      try {
        const { data: preferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (preferencesError) {
          console.error("Error fetching preferences:", preferencesError);
          throw preferencesError;
        }

        if (!preferences) {
          console.log("No preferences found for user");
          return;
        }

        console.log("Found user preferences:", preferences);

        const details: Record<string, any> = {};
        const analyzedItems = await Promise.all(processedMenu[0].items.map(async (item) => {
          const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
          const result = await calculateMenuItemScore(itemContent, preferences);
          const matchResult = resolveMatchType(result.score, result.factors, itemContent);
          
          details[item.id] = {
            score: result.score,
            ...matchResult
          };

          return {
            ...item,
            matchScore: result.score
          };
        }));

        // Sort items by score
        const sortedItems = analyzedItems.sort((a, b) => 
          (b.matchScore || 0) - (a.matchScore || 0)
        );

        setAnalyzedMenu([{ ...processedMenu[0], items: sortedItems }]);
        setItemMatchDetails(details);

      } catch (error) {
        console.error("Error in menu analysis:", error);
      }
    };

    analyzeMenu();
  }, [processedMenu]);

  return { itemMatchDetails, analyzedMenu };
};