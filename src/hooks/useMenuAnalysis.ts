import { useState, useEffect } from 'react';
import { MenuCategory } from '@/types/restaurant';
import { supabase } from "@/integrations/supabase/client";

export const useMenuAnalysis = (processedMenu: MenuCategory[] | null) => {
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const [analyzedMenu, setAnalyzedMenu] = useState<MenuCategory[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const analyzeMenu = async () => {
      if (!processedMenu?.[0]?.items) return;
      
      try {
        setIsAnalyzing(true);
        console.log("🔍 Starting menu analysis");

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log("❌ No authenticated user found");
          return;
        }

        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (!preferences) {
          console.log("❌ No user preferences found");
          return;
        }

        console.log("✅ User preferences loaded:", preferences);

        const details: Record<string, any> = {};
        let bestMatchScore = -1;
        let bestMatchId = null;

        // Analyze each menu item using the edge function
        for (const item of processedMenu[0].items) {
          console.log(`🔍 Analyzing item: ${item.name}`);
          
          const { data: analysis, error } = await supabase.functions.invoke('menu-analyzer', {
            body: { menuItem: item, preferences }
          });

          if (error) {
            console.error(`❌ Error analyzing item ${item.name}:`, error);
            continue;
          }

          details[item.id] = analysis;
          
          if (analysis.score > bestMatchScore) {
            bestMatchScore = analysis.score;
            bestMatchId = item.id;
          }

          console.log(`✅ Analysis complete for ${item.name}:`, analysis);
        }

        // Mark the best match
        if (bestMatchId) {
          details[bestMatchId] = {
            ...details[bestMatchId],
            isTopMatch: true
          };
        }

        setItemMatchDetails(details);
        setAnalyzedMenu(processedMenu);
        console.log("✨ Menu analysis complete");

      } catch (error) {
        console.error("❌ Error in menu analysis:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeMenu();
  }, [processedMenu]);

  return { itemMatchDetails, analyzedMenu, isAnalyzing };
};