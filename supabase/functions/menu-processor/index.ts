import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, item, preferences } = await req.json();

    if (action === 'analyze-item') {
      console.log('Analyzing menu item:', item);
      console.log('User preferences:', preferences);

      const reasons: string[] = [];
      const warnings: string[] = [];
      let score = 75; // Default score
      
      const itemText = `${item.name} ${item.description || ''}`.toLowerCase();

      // Check for favorite proteins (highest priority)
      const proteinMatch = preferences.favorite_proteins?.some(
        protein => itemText.includes(protein.toLowerCase())
      );
      if (proteinMatch) {
        score += 20;
        reasons.push("Contains your favorite protein!");
      }

      // Check cuisine preferences (high priority)
      const cuisineMatch = preferences.cuisine_preferences?.some(
        cuisine => itemText.includes(cuisine.toLowerCase())
      );
      if (cuisineMatch) {
        score += 15;
        reasons.push("Matches your preferred cuisine style");
      }

      // Check favorite ingredients (medium priority)
      const ingredientMatch = preferences.favorite_ingredients?.some(
        ingredient => itemText.includes(ingredient.toLowerCase())
      );
      if (ingredientMatch) {
        score += 10;
        reasons.push("Includes ingredients you love");
      }

      // Check dietary restrictions (highest negative priority)
      const dietaryIssue = preferences.dietary_restrictions?.some(
        restriction => itemText.includes(restriction.toLowerCase())
      );
      if (dietaryIssue) {
        score -= 50;
        warnings.push("Contains ingredients you prefer to avoid");
      }

      // Only return detailed reasons for very good or concerning matches
      const response = {
        score,
        allReasons: score >= 85 ? reasons : [],
        allWarnings: score <= 40 ? warnings : []
      };

      console.log('Analysis result:', response);
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Menu processing logic
    // This part of the code should handle the processing of the menu data
    // For example, fetching menu items from a database or an API
    // and returning them in a structured format.

  } catch (error) {
    console.error('Error in menu-processor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
