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
    
    console.log("🔍 Analyzing restaurant:", restaurant);
    console.log("👤 User preferences:", preferences);

    if (!restaurant) {
      console.error("❌ No restaurant data provided");
      throw new Error("Restaurant data is required");
    }

    const prompt = `As a friendly AI restaurant expert, analyze this restaurant and the user's preferences to generate a personalized match score and explanation.

Restaurant Details:
- Name: ${restaurant.name || 'Unknown'}
- Cuisine Types: ${restaurant.types?.join(', ') || 'Not specified'}
- Price Level: ${restaurant.priceLevel || 'Not specified'}
- Features: ${Object.entries(restaurant)
  .filter(([key, value]) => key.startsWith('serves') && value === true)
  .map(([key]) => key.replace('serves', ''))
  .join(', ') || 'None specified'}

User Preferences:
- Cuisine Preferences: ${preferences.cuisinePreferences?.join(', ') || 'None specified'}
- Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None specified'}
- Favorite Ingredients: ${preferences.favoriteIngredients?.join(', ') || 'None specified'}
- Spice Level (1-5): ${preferences.spiceLevel || 'Not specified'}
- Price Range: ${preferences.priceRange || 'Not specified'}
- Atmosphere Preferences: ${preferences.atmospherePreferences?.join(', ') || 'None specified'}

Generate:
1. A match score (0-100) based on how well this restaurant aligns with the user's preferences
2. Three clear, specific reasons explaining why this score was given. Be direct and honest about both positive and negative aspects.

Format the response as a JSON object with 'matchScore' and 'reasons' fields. Be specific and personalized in the reasons.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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