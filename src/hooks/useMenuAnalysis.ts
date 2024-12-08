import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MenuCategory } from "@/types/restaurant";

export const useMenuAnalysis = (processedMenu: MenuCategory[] | null) => {
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const [analyzedMenu, setAnalyzedMenu] = useState<MenuCategory[] | null>(null);
  const [topMatch, setTopMatch] = useState<any>(null);

  useEffect(() => {
    const analyzeMenuItem = (item: any, preferences: any) => {
      console.log('Analyzing menu item:', item.name);
      
      const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
      let score = 50;
      let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
      let reasons: string[] = [];
      
      // Dietary restrictions (critical)
      const dietaryConflicts = preferences.dietary_restrictions?.filter(
        (restriction: string) => itemContent.includes(restriction.toLowerCase())
      );
      
      if (dietaryConflicts?.length) {
        score = 20;
        matchType = 'warning';
        reasons.push(`Contains ${dietaryConflicts[0].toLowerCase()}`);
        return { score, matchType, warning: reasons[0] };
      }

      // Protein preferences (major boost)
      const proteinMatches = preferences.favorite_proteins?.filter(
        (protein: string) => itemContent.includes(protein.toLowerCase())
      );
      
      if (proteinMatches?.length) {
        score += 25;
        reasons.push(`Made with ${proteinMatches[0].toLowerCase()}, one of your favorite proteins`);
      }

      // Favorite ingredients (significant boost)
      const ingredientMatches = preferences.favorite_ingredients?.filter(
        (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
      );
      
      if (ingredientMatches?.length) {
        score += 15;
        reasons.push(`Includes ${ingredientMatches[0].toLowerCase()}, an ingredient you love`);
      }

      // Preparation method bonus
      const healthyMethods = {
        'grilled': 'Healthy grilled preparation',
        'steamed': 'Light steamed cooking method',
        'baked': 'Oven-baked for better nutrition',
        'roasted': 'Flavorful roasted preparation'
      };

      for (const [method, description] of Object.entries(healthyMethods)) {
        if (itemContent.includes(method)) {
          score += 10;
          reasons.push(description);
          break;
        }
      }

      // Special indicators
      if (itemContent.includes('signature') || itemContent.includes('chef special')) {
        score += 10;
        reasons.push('Chef\'s special creation');
      }

      // Determine match type based on score
      if (score >= 90) matchType = 'perfect';
      else if (score >= 75) matchType = 'good';
      else if (score < 40) matchType = 'warning';

      // Join all reasons with proper formatting
      const formattedReasons = reasons.length > 0 
        ? reasons.join(' • ')
        : 'Based on your general preferences';

      return {
        score,
        matchType,
        reason: formattedReasons,
      };
    };

    const loadMatchDetails = async () => {
      if (!processedMenu?.[0]?.items) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!preferences) return;

        const details: Record<string, any> = {};
        let bestMatch = { score: -1, item: null, analysis: null };

        processedMenu[0].items.forEach(item => {
          const analysis = analyzeMenuItem(item, preferences);
          details[item.id] = analysis;

          if (analysis.score > bestMatch.score) {
            bestMatch = { score: analysis.score, item, analysis };
          }
        });

        setItemMatchDetails(details);
        setTopMatch(bestMatch.score > 0 ? { ...bestMatch.item, analysis: bestMatch.analysis } : null);
        
        setAnalyzedMenu([{
          ...processedMenu[0],
          items: processedMenu[0].items.map(item => ({
            ...item,
            analysis: details[item.id]
          }))
        }]);

      } catch (error) {
        console.error("Error in loadMatchDetails:", error);
      }
    };

    loadMatchDetails();
  }, [processedMenu]);

  return { itemMatchDetails, analyzedMenu, topMatch };
};