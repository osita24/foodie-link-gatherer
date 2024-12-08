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
    console.log('Analyzing menu item:', item);
    console.log('User preferences:', preferences);

    if (action !== 'analyze-item') {
      throw new Error('Invalid action');
    }

    const itemText = `${item.name} ${item.description || ''}`.toLowerCase();
    let score = 50;
    let reasons = [];
    let warnings = [];

    // Check favorite proteins
    if (preferences.favorite_proteins) {
      for (const protein of preferences.favorite_proteins) {
        if (itemText.includes(protein.toLowerCase())) {
          score += 25;
          reasons.push(`Contains ${protein} (your favorite protein)`);
        }
      }
    }

    // Check dietary restrictions
    if (preferences.dietary_restrictions) {
      for (const restriction of preferences.dietary_restrictions) {
        if (itemText.includes(restriction.toLowerCase())) {
          score -= 40;
          warnings.push(`Contains ${restriction} (dietary restriction)`);
        }
      }
    }

    // Check favorite ingredients
    if (preferences.favorite_ingredients) {
      for (const ingredient of preferences.favorite_ingredients) {
        if (itemText.includes(ingredient.toLowerCase())) {
          score += 15;
          reasons.push(`Includes ${ingredient} (ingredient you love)`);
        }
      }
    }

    // Check cuisine preferences
    if (preferences.cuisine_preferences) {
      for (const cuisine of preferences.cuisine_preferences) {
        const cuisineTerms = cuisine.toLowerCase().split(' ');
        if (cuisineTerms.some(term => itemText.includes(term))) {
          score += 20;
          reasons.push(`Matches ${cuisine} cuisine preference`);
        }
      }
    }

    // Normalize score
    score = Math.min(Math.max(score, 0), 100);

    // Get primary reason/warning
    const primaryReason = reasons.length > 0 ? reasons[0] : undefined;
    const primaryWarning = warnings.length > 0 ? warnings[0] : undefined;

    console.log('Analysis result:', { score, primaryReason, primaryWarning });

    return new Response(
      JSON.stringify({
        score,
        reason: primaryReason,
        warning: primaryWarning,
        allReasons: reasons,
        allWarnings: warnings,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in menu-processor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});