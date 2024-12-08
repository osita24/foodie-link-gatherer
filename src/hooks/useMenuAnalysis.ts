import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MenuCategory } from "@/types/restaurant";
import { calculateItemMatch } from './menu-analysis/itemMatcher';
import { analyzeMenuData } from './menu-analysis/menuAnalyzer';

export const useMenuAnalysis = (processedMenu: MenuCategory[] | null) => {
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const [analyzedMenu, setAnalyzedMenu] = useState<MenuCategory[] | null>(null);

  useEffect(() => {
    const analyzeMenuItems = async () => {
      if (!processedMenu?.[0]?.items) {
        console.log("No menu items to analyze");
        return;
      }

      try {
        // Get user preferences
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log("No authenticated user found");
          return;
        }

        console.log("🔍 Fetching user preferences...");
        const { data: preferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (preferencesError) {
          console.error("Error fetching preferences:", preferencesError);
          throw preferencesError;
        }

        console.log("✅ Found user preferences:", preferences);

        // Analyze each menu item
        const matchDetails: Record<string, any> = {};
        const analyzedItems = await Promise.all(
          processedMenu[0].items.map(async (item) => {
            const analysis = await calculateItemMatch(item, preferences);
            matchDetails[item.id] = analysis;
            return {
              ...item,
              matchScore: analysis.score,
              matchType: analysis.matchType
            };
          })
        );

        // Sort items by match score
        const sortedItems = analyzedItems.sort((a, b) => 
          (b.matchScore || 0) - (a.matchScore || 0)
        );

        console.log(`✨ Analyzed ${analyzedItems.length} menu items`);
        
        setItemMatchDetails(matchDetails);
        setAnalyzedMenu([{
          ...processedMenu[0],
          items: sortedItems
        }]);

      } catch (error) {
        console.error("❌ Error analyzing menu:", error);
      }
    };

    analyzeMenuItems();
  }, [processedMenu]);

  return { itemMatchDetails, analyzedMenu };
};