import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MenuCategory } from "@/types/restaurant";

export const useMenuAnalysis = (processedMenu: MenuCategory[] | null) => {
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const [analyzedMenu, setAnalyzedMenu] = useState<MenuCategory[] | null>(null);

  useEffect(() => {
    const loadMatchDetails = async () => {
      if (!processedMenu?.[0]?.items) return;

      const details: Record<string, any> = {};
      
      // First get the current user
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
          console.log("No preferences found for user, using default scores");
          processedMenu[0].items.forEach(item => {
            details[item.id] = { score: 50, matchType: 'neutral' };
          });
          setItemMatchDetails(details);
          return;
        }

        console.log("Found user preferences:", preferences);

        for (const item of processedMenu[0].items) {
          try {
            console.log("Analyzing item with preferences:", item.name);
            const { data, error } = await supabase.functions.invoke('menu-processor', {
              body: { 
                action: 'analyze-item',
                item,
                preferences
              }
            });

            if (error || !data) {
              console.error("Error analyzing item:", error);
              details[item.id] = { score: 50, matchType: 'neutral' };
              continue;
            }

            console.log("Analysis result for", item.name, ":", data);
            details[item.id] = data;
          } catch (error) {
            console.error("Error getting match details:", error);
            details[item.id] = { score: 50, matchType: 'neutral' };
          }
        }

        // Sort items by score for better presentation
        const sortedItems = [...processedMenu[0].items].sort((a, b) => {
          const scoreA = details[a.id]?.score || 0;
          const scoreB = details[b.id]?.score || 0;
          return scoreB - scoreA;
        });

        setAnalyzedMenu([{ ...processedMenu[0], items: sortedItems }]);
        setItemMatchDetails(details);
      } catch (error) {
        console.error("Error in loadMatchDetails:", error);
        setItemMatchDetails(details);
      }
    };

    loadMatchDetails();
  }, [processedMenu]);

  return { itemMatchDetails, analyzedMenu };
};