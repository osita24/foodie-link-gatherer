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
    const { menuItem, preferences } = await req.json();
    console.log("🔍 Analyzing menu item:", menuItem.name);
    console.log("👤 User preferences:", preferences);

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a culinary expert and personal food advisor. Analyze menu items against user preferences to provide personalized recommendations.
            Focus on these aspects:
            - Dietary restrictions (critical)
            - Favorite proteins and ingredients
            - Cuisine preferences
            - Cooking methods
            - Health considerations
            
            Respond with:
            1. A match score (0-100)
            2. A detailed but concise reason (1-2 sentences max)
            3. A match type (perfect/good/neutral/warning)
            4. Any warnings about dietary restrictions
            
            Keep the tone friendly and personal. Use "you" and "your" to make it feel tailored.`
          },
          {
            role: "user",
            content: `Menu Item: ${menuItem.name}
            Description: ${menuItem.description || 'No description available'}
            
            User Preferences:
            - Dietary Restrictions: ${preferences.dietary_restrictions?.join(', ') || 'None'}
            - Favorite Proteins: ${preferences.favorite_proteins?.join(', ') || 'None specified'}
            - Cuisine Preferences: ${preferences.cuisine_preferences?.join(', ') || 'None specified'}
            - Favorite Ingredients: ${preferences.favorite_ingredients?.join(', ') || 'None specified'}
            - Spice Level: ${preferences.spice_level || 'Not specified'}
            
            Analyze this menu item against these preferences and provide a personalized recommendation.`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const data = await openAIResponse.json();
    const analysis = data.choices[0].message.content;
    
    // Parse the AI response to extract key information
    const scoreMatch = analysis.match(/(\d+)\/100|(\d+)%|score:?\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]) : 50;
    
    const warningMatch = analysis.toLowerCase().includes('warning') || 
                        analysis.toLowerCase().includes('avoid') || 
                        analysis.toLowerCase().includes('restriction');
    
    let matchType = 'neutral';
    if (score >= 90) matchType = 'perfect';
    else if (score >= 75) matchType = 'good';
    else if (warningMatch) matchType = 'warning';

    // Clean up the reason text
    const reason = analysis
      .replace(/(\d+)\/100|(\d+)%|score:?\s*(\d+)/g, '')
      .replace(/match type:.*$/i, '')
      .replace(/warning:.*$/i, '')
      .trim();

    console.log("✨ Analysis complete:", { score, matchType, reason });

    return new Response(
      JSON.stringify({
        score,
        reason,
        matchType,
        warning: warningMatch ? "Contains ingredients you should avoid" : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ Error analyzing menu item:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});