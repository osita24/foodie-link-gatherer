import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    if (!restaurant) {
      throw new Error("Restaurant data is required");
    }

    const prompt = `As a friendly AI restaurant expert, analyze this restaurant and the user's preferences to generate a personalized match score and explanation.

Restaurant Details:
- Name: ${restaurant.name}
- Cuisine Types: ${restaurant.types?.join(', ') || 'Not specified'}
- Price Level: ${restaurant.priceLevel}
- Features: ${Object.entries(restaurant)
  .filter(([key, value]) => key.startsWith('serves') && value === true)
  .map(([key]) => key.replace('serves', ''))
  .join(', ')}

User Preferences:
- Cuisine Preferences: ${preferences.cuisinePreferences?.join(', ') || 'None specified'}
- Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None specified'}
- Favorite Ingredients: ${preferences.favoriteIngredients?.join(', ') || 'None specified'}
- Spice Level: ${preferences.spiceLevel || 'Not specified'}
- Price Range: ${preferences.priceRange || 'Not specified'}
- Atmosphere Preferences: ${preferences.atmospherePreferences?.join(', ') || 'None specified'}

Generate:
1. A match score (0-100) based on how well this restaurant aligns with the user's preferences
2. Three clear, specific reasons explaining the score. Be direct, engaging, and personalized. Focus on both positive matches and potential considerations.

Format the response as a JSON object with 'matchScore' and 'reasons' fields. Make the reasons fun and helpful for decision-making.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable and friendly restaurant expert that provides clear, specific insights to help users make dining decisions. Your tone is casual and engaging."
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
      JSON.stringify({ 
        error: error.message,
        matchScore: 50,
        reasons: [
          "We're having trouble analyzing this restaurant right now",
          "Please try again later",
          "Our AI is taking a quick break"
        ]
      }),
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