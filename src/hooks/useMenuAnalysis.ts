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
      let reasons: string[] = [];
      let warnings: string[] = [];

      // Check dietary restrictions first (critical)
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
          if (r === "gluten-free" && 
              (itemContent.includes("bread") || 
               itemContent.includes("pasta") || 
               itemContent.includes("flour"))) {
            return true;
          }
          return itemContent.includes(r);
        }
      );

      if (dietaryConflicts?.length > 0) {
        score = 20;
        warnings.push(`Contains ${dietaryConflicts[0]}`);
      }

      // Check favorite proteins (major positive)
      const proteinMatches = preferences.favorite_proteins?.filter(
        (protein: string) => itemContent.includes(protein.toLowerCase())
      );
      
      if (proteinMatches?.length > 0) {
        score += 30;
        reasons.push(`Contains ${proteinMatches[0]}`);
      }

      // Check cuisine preferences (significant positive)
      const cuisineMatches = preferences.cuisine_preferences?.filter(
        (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
      );
      
      if (cuisineMatches?.length > 0) {
        score += 25;
        reasons.push(`Matches ${cuisineMatches[0]} cuisine`);
      }

      // Check ingredients to avoid
      const ingredientsToAvoid = preferences.favorite_ingredients?.filter(
        (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
      );
      
      if (ingredientsToAvoid?.length > 0) {
        score -= 30;
        warnings.push(`Contains ${ingredientsToAvoid[0]}`);
      }

      // Add neutral reasons if no specific matches found
      if (reasons.length === 0 && warnings.length === 0) {
        if (itemContent.includes("vegetarian") || itemContent.includes("vegan")) {
          reasons.push("Plant-based option available");
        } else if (itemContent.includes("spicy") || itemContent.includes("hot")) {
          reasons.push("Spicy dish - adjust to taste");
        } else if (itemContent.includes("fresh") || itemContent.includes("seasonal")) {
          reasons.push("Made with fresh ingredients");
        } else if (itemContent.includes("grilled")) {
          reasons.push("Grilled preparation");
        } else if (itemContent.includes("house") || itemContent.includes("signature")) {
          reasons.push("House specialty");
        } else {
          reasons.push("Standard menu item");
        }
      }

      // Determine match type based on final score
      let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
      if (score >= 90) matchType = 'perfect';
      else if (score >= 75) matchType = 'good';
      else if (score < 40) matchType = 'warning';

      // Cap score between 0 and 100
      score = Math.max(0, Math.min(100, score));

      console.log(`Analysis result for ${item.name}:`, {
        score,
        reasons,
        warnings,
        matchType
      });

      return {
        score,
        reason: reasons[0],
        warning: warnings[0],
        matchType
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
        const analyzedItems = processedMenu[0].items.map(item => ({
          ...item,
          analysis: analyzeMenuItem(item, preferences)
        }));

        // Sort items by score
        const sortedItems = analyzedItems.sort((a, b) => {
          const scoreA = a.analysis.score || 0;
          const scoreB = b.analysis.score || 0;
          return scoreB - scoreA;
        });

        // Create match details for each item
        sortedItems.forEach(item => {
          details[item.id] = item.analysis;
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