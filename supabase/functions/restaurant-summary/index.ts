import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { restaurant, preferences } = await req.json();
    
    console.log("🔍 Analyzing restaurant:", restaurant.name);
    console.log("👤 User preferences:", preferences);

    const prompt = `As a friendly AI restaurant expert, analyze this restaurant and generate a personalized recommendation based on the user's preferences.

Restaurant Details:
- Name: ${restaurant.name}
- Cuisine Types: ${restaurant.types?.join(', ') || 'Not specified'}
- Price Level: ${restaurant.priceLevel}
- Rating: ${restaurant.rating}
- Features: ${Object.entries(restaurant)
  .filter(([key, value]) => key.startsWith('serves') && value === true)
  .map(([key]) => key.replace('serves', ''))
  .join(', ')}

User Preferences:
- Cuisine Preferences: ${preferences.cuisine_preferences?.join(', ') || 'None specified'}
- Dietary Restrictions: ${preferences.dietary_restrictions?.join(', ') || 'None specified'}
- Favorite Ingredients: ${preferences.favorite_ingredients?.join(', ') || 'None specified'}
- Spice Level: ${preferences.spice_level || 'Not specified'}
- Price Range: ${preferences.price_range || 'Not specified'}
- Atmosphere Preferences: ${preferences.atmosphere_preferences?.join(', ') || 'None specified'}

Based on this information:
1. Choose ONE recommendation level: "SKIP IT", "WORTH A TRY", or "MUST VISIT"
2. Provide THREE specific, personalized reasons for your recommendation. Be fun and engaging!

Format the response as a JSON object with 'recommendation' and 'reasons' fields. Make the reasons helpful for decision-making.`;

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
        recommendation: "WORTH A TRY",
        reasons: [
          "We're having trouble analyzing this restaurant right now",
          "Our AI food critic is taking a quick break",
          "Check back soon for a personalized recommendation!"
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