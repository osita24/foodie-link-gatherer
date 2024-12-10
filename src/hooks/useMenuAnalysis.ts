import { useState, useEffect, useMemo } from 'react';
import { MenuCategory } from "@/types/restaurant";
import { calculateMenuItemScore } from '@/utils/menu/scoreCalculator';
import { resolveMatchType } from '@/utils/menu/matchTypeResolver';
import { supabase } from "@/integrations/supabase/client";

export const useMenuAnalysis = (processedMenu: MenuCategory[] | null) => {
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const [analyzedMenu, setAnalyzedMenu] = useState<MenuCategory[] | null>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);

  // Fetch user preferences only once and cache them
  useEffect(() => {
    const loadPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      console.log("🔍 Loading preferences for user:", user.id);
      
      try {
        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("❌ Error fetching preferences:", error);
          throw error;
        }

        if (!preferences) {
          console.log("⚠️ No preferences found for user");
          return;
        }

        console.log("✅ Found user preferences:", preferences);
        setUserPreferences(preferences);
      } catch (error) {
        console.error("❌ Error in preferences loading:", error);
      }
    };

    loadPreferences();
  }, []);

  // Memoize menu analysis to prevent unnecessary recalculations
  useEffect(() => {
    const analyzeMenu = async () => {
      if (!processedMenu?.[0]?.items || !userPreferences) {
        console.log("⏳ Waiting for menu items or preferences...");
        return;
      }
      
      console.log("🔄 Starting menu analysis with items:", processedMenu[0].items.length);

      try {
        const details: Record<string, any> = {};
        const analyzedItems = processedMenu[0].items.map(item => {
          const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
          console.log("📝 Analyzing item:", item.name);
          
          const { score, factors } = calculateMenuItemScore(itemContent, userPreferences);
          const matchResult = resolveMatchType(score, factors, itemContent);
          
          details[item.id] = {
            score,
            ...matchResult
          };

          return {
            ...item,
            matchScore: score
          };
        });

        // Sort items by score and group similar scores
        const sortedItems = analyzedItems.sort((a, b) => {
          const scoreDiff = (b.matchScore || 0) - (a.matchScore || 0);
          // If scores are close (within 10%), consider other factors
          if (Math.abs(scoreDiff) < 10) {
            // Prioritize items with descriptions
            return (b.description?.length || 0) - (a.description?.length || 0);
          }
          return scoreDiff;
        });

        console.log("✅ Menu analysis complete. Items processed:", sortedItems.length);
        setAnalyzedMenu([{ ...processedMenu[0], items: sortedItems }]);
        setItemMatchDetails(details);

      } catch (error) {
        console.error("❌ Error in menu analysis:", error);
      }
    };

    analyzeMenu();
  }, [processedMenu, userPreferences]);

  return { itemMatchDetails, analyzedMenu };
};