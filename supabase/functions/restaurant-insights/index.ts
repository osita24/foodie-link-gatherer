import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { corsHeaders } from "../_shared/cors.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { restaurant, preferences } = await req.json();

    console.log("🔍 Analyzing restaurant:", restaurant.name);
    console.log("👤 User preferences:", preferences);

    const prompt = `As a friendly AI restaurant expert, analyze this restaurant and the user's preferences to generate a personalized match score and explanation.

Restaurant Details:
- Name: ${restaurant.name}
- Cuisine Types: ${restaurant.types?.join(', ')}
- Price Level: ${restaurant.priceLevel}
- Features: ${Object.entries(restaurant)
  .filter(([key, value]) => key.startsWith('serves') && value === true)
  .map(([key]) => key.replace('serves', ''))
  .join(', ')}

User Preferences:
- Cuisine Preferences: ${preferences.cuisinePreferences?.join(', ')}
- Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ')}
- Favorite Ingredients: ${preferences.favoriteIngredients?.join(', ')}
- Spice Level (1-5): ${preferences.spiceLevel}
- Price Range: ${preferences.priceRange}
- Atmosphere Preferences: ${preferences.atmospherePreferences?.join(', ')}

Generate:
1. A match score (0-100)
2. Three clear, specific reasons explaining the score that will help the user decide whether to visit this restaurant.

Format the response as a JSON object with 'matchScore' and 'reasons' fields. Be specific and personalized in the reasons.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable restaurant expert that provides clear, specific insights to help users make dining decisions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content);
    console.log("✨ Generated insights:", response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});