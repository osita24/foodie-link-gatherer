import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MenuCategory } from "@/types/restaurant";

export const useMenuAnalysis = (processedMenu: MenuCategory[] | null) => {
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const [analyzedMenu, setAnalyzedMenu] = useState<MenuCategory[] | null>(null);

  useEffect(() => {
    const analyzeMenuItem = (item: any, preferences: any) => {
      console.log('🔍 Analyzing menu item:', item.name);
      console.log('👤 User preferences:', preferences);
      
      const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
      let score = 50;
      let reasons: string[] = [];
      let warnings: string[] = [];

      // Check dietary restrictions first (critical)
      if (preferences.dietary_restrictions?.includes('vegetarian')) {
        const meatKeywords = [
          'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb', 'turkey',
          'bacon', 'ham', 'sausage', 'prosciutto', 'salami', 'pepperoni'
        ];
        
        const hasMeat = meatKeywords.some(meat => itemContent.includes(meat));
        if (hasMeat) {
          return {
            score: 20,
            warning: "Not suitable for vegetarians - contains meat",
            matchType: 'warning'
          };
        } else {
          score += 30;
          reasons.push("Vegetarian-friendly option");
        }
      }

      // Check vegan preferences
      if (preferences.dietary_restrictions?.includes('vegan')) {
        const nonVeganKeywords = ['cheese', 'cream', 'milk', 'egg', 'butter', 'yogurt', 'mayo'];
        const hasNonVegan = nonVeganKeywords.some(ingredient => itemContent.includes(ingredient));

        if (hasNonVegan) {
          return {
            score: 20,
            warning: "Not suitable for vegans - contains dairy/eggs",
            matchType: 'warning'
          };
        } else {
          score += 30;
          reasons.push("Vegan-friendly option");
        }
      }

      // Check gluten-free requirements
      if (preferences.dietary_restrictions?.includes('gluten-free')) {
        const glutenKeywords = ['bread', 'pasta', 'flour', 'wheat', 'breaded', 'battered'];
        const hasGluten = glutenKeywords.some(ingredient => itemContent.includes(ingredient));

        if (hasGluten) {
          return {
            score: 20,
            warning: "Contains gluten - not suitable for gluten-free diet",
            matchType: 'warning'
          };
        } else {
          score += 25;
          reasons.push("Gluten-free friendly");
        }
      }

      // Check favorite proteins (if no dietary conflicts)
      const proteinMatches = preferences.favorite_proteins?.filter(
        (protein: string) => itemContent.includes(protein.toLowerCase())
      );
      
      if (proteinMatches?.length > 0 && !warnings.length) {
        score += 35;
        reasons.push(`Features ${proteinMatches[0]}, your preferred protein`);
      }

      // Check cuisine preferences
      const cuisineMatches = preferences.cuisine_preferences?.filter(
        (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
      );
      
      if (cuisineMatches?.length > 0) {
        score += 25;
        reasons.push(`Matches your favorite ${cuisineMatches[0]} cuisine style`);
      }

      // Check foods to avoid
      const avoidMatches = preferences.favorite_ingredients?.filter(
        (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
      );
      
      if (avoidMatches?.length > 0) {
        return {
          score: 30,
          warning: `Contains ${avoidMatches[0]} which you prefer to avoid`,
          matchType: 'warning'
        };
      }

      // Analyze specific ingredients and preparation methods
      const healthyKeywords = {
        "grilled": "Healthy grilled preparation",
        "steamed": "Light steamed preparation",
        "fresh": "Made with fresh ingredients",
        "organic": "Features organic ingredients",
        "house-made": "Freshly prepared in-house"
      };

      for (const [keyword, reason] of Object.entries(healthyKeywords)) {
        if (itemContent.includes(keyword)) {
          score += 15;
          reasons.push(reason);
          break;
        }
      }

      // Special indicators
      if (itemContent.includes("signature") || itemContent.includes("special")) {
        score += 10;
        reasons.push("Chef's special recommendation");
      }

      // If no specific matches found
      if (reasons.length === 0) {
        reasons.push("Standard menu option");
        score = 50;
      }

      // Determine match type based on final score
      let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
      
      // Cap score between 0 and 100
      score = Math.max(0, Math.min(100, score));

      if (score >= 90) {
        matchType = 'perfect';
        reasons[0] = `Perfect match: ${reasons[0]}`;
      } else if (score >= 75) {
        matchType = 'good';
        reasons[0] = `Great choice: ${reasons[0]}`;
      } else if (score < 40) {
        matchType = 'warning';
      }

      console.log(`✨ Analysis result for ${item.name}:`, {
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