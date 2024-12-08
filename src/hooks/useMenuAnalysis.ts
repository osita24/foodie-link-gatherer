import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MenuCategory } from "@/types/restaurant";

export const useMenuAnalysis = (processedMenu: MenuCategory[] | null) => {
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const [analyzedMenu, setAnalyzedMenu] = useState<MenuCategory[] | null>(null);

  useEffect(() => {
    const analyzeMenuItem = (item: any, preferences: any) => {
      console.log('Analyzing menu item:', item.name, 'with preferences:', preferences);
      
      const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
      let score = 50;
      let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
      let reasons: string[] = [];
      let warnings: string[] = [];

      // Check dietary restrictions (critical)
      const dietaryConflicts = preferences.dietary_restrictions?.filter(
        (restriction: string) => {
          const r = restriction.toLowerCase();
          if (r === "vegetarian" && 
              (itemContent.includes("meat") || 
               itemContent.includes("chicken") || 
               itemContent.includes("beef") || 
               itemContent.includes("pork") ||
               itemContent.includes("fish"))) {
            return true;
          }
          if (r === "vegan" && 
              (itemContent.includes("meat") || 
               itemContent.includes("cheese") || 
               itemContent.includes("cream") || 
               itemContent.includes("milk") ||
               itemContent.includes("egg"))) {
            return true;
          }
          return itemContent.includes(r);
        }
      );

      if (dietaryConflicts?.length > 0) {
        console.log('Found dietary conflicts:', dietaryConflicts);
        score = 20;
        matchType = 'warning';
        warnings.push(`Contains ${dietaryConflicts[0]}`);
      }

      // Check favorite proteins (major positive)
      const proteinMatches = preferences.favorite_proteins?.filter(
        (protein: string) => itemContent.includes(protein.toLowerCase())
      );
      
      if (proteinMatches?.length > 0) {
        console.log('Found protein matches:', proteinMatches);
        score += 30;
        reasons.push(`Contains ${proteinMatches[0]}`);
      }

      // Check cuisine preferences
      const cuisineMatches = preferences.cuisine_preferences?.filter(
        (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
      );
      
      if (cuisineMatches?.length > 0) {
        console.log('Found cuisine matches:', cuisineMatches);
        score += 25;
        reasons.push(`Matches ${cuisineMatches[0]} cuisine`);
      }

      // Check ingredients to avoid
      const ingredientsToAvoid = preferences.favorite_ingredients?.filter(
        (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
      );

      if (ingredientsToAvoid?.length > 0) {
        console.log('Found ingredients to avoid:', ingredientsToAvoid);
        score -= 30;
        warnings.push(`Contains ${ingredientsToAvoid[0]}`);
      }

      // Determine final match type
      if (score >= 90) matchType = 'perfect';
      else if (score >= 75) matchType = 'good';
      else if (score < 40) matchType = 'warning';

      // Cap score between 0 and 100
      score = Math.max(0, Math.min(100, score));

      console.log('Final analysis for', item.name, ':', {
        score,
        matchType,
        reasons,
        warnings
      });

      return {
        score,
        matchType,
        reason: reasons[0],
        warning: warnings[0]
      };
    };

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
          console.log("No preferences found for user");
          return;
        }

        console.log("Found user preferences:", preferences);

        // Analyze each menu item
        for (const item of processedMenu[0].items) {
          details[item.id] = analyzeMenuItem(item, preferences);
        }

        // Sort items by score
        const sortedItems = [...processedMenu[0].items].sort((a, b) => {
          const scoreA = details[a.id]?.score || 0;
          const scoreB = details[b.id]?.score || 0;
          return scoreB - scoreA;
        });

        setAnalyzedMenu([{ ...processedMenu[0], items: sortedItems }]);
        setItemMatchDetails(details);

      } catch (error) {
        console.error("Error in loadMatchDetails:", error);
      }
    };

    loadMatchDetails();
  }, [processedMenu]);

  return { itemMatchDetails, analyzedMenu };
};