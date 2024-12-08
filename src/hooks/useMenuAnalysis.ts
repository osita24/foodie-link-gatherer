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
      let bonusPoints = 0;

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
        score += 35;
        bonusPoints += 10;
        reasons.push(`Features ${proteinMatches[0]}`);
      }

      // Check cuisine preferences (significant positive)
      const cuisineMatches = preferences.cuisine_preferences?.filter(
        (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
      );
      
      if (cuisineMatches?.length > 0) {
        score += 25;
        bonusPoints += 5;
        reasons.push(`Matches ${cuisineMatches[0]} cuisine style`);
      }

      // Check favorite ingredients
      const favoriteIngredients = preferences.favorite_ingredients?.filter(
        (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
      );
      
      if (favoriteIngredients?.length > 0) {
        score += 20;
        bonusPoints += 5;
        reasons.push(`Contains ${favoriteIngredients[0]} that you love`);
      }

      // Add specific dish type bonuses
      if (itemContent.includes("fresh") || itemContent.includes("seasonal")) {
        bonusPoints += 3;
        reasons.push("Made with fresh ingredients");
      }
      if (itemContent.includes("house special") || itemContent.includes("signature")) {
        bonusPoints += 4;
        reasons.push("Restaurant's signature dish");
      }
      if (itemContent.includes("grilled") || itemContent.includes("roasted")) {
        bonusPoints += 2;
        reasons.push("Prepared with healthy cooking method");
      }

      // Determine match type based on final score + bonus points
      let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
      const finalScore = Math.min(100, score + bonusPoints);

      if (finalScore >= 90) matchType = 'perfect';
      else if (finalScore >= 75) matchType = 'good';
      else if (finalScore < 40) matchType = 'warning';

      // Ensure we always have a reason
      if (reasons.length === 0 && !warnings.length) {
        if (itemContent.includes("spicy")) {
          reasons.push("Spicy option available");
        } else if (itemContent.includes("vegetarian")) {
          reasons.push("Vegetarian-friendly option");
        } else if (itemContent.includes("classic")) {
          reasons.push("Classic menu favorite");
        } else {
          reasons.push("Traditional preparation");
        }
      }

      console.log(`Analysis result for ${item.name}:`, {
        score: finalScore,
        reasons,
        warnings,
        matchType
      });

      return {
        score: finalScore,
        reason: reasons[0],
        warning: warnings[0],
        matchType
      };
    };

    const loadMatchDetails = async () => {
      if (!processedMenu?.[0]?.items) return;

      const details: Record<string, any> = {};
      
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