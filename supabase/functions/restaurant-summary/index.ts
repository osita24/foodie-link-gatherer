import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurant, preferences } = await req.json();

    console.log("🏪 Processing restaurant:", restaurant.name);
    console.log("👤 User preferences:", preferences);

    const prompt = `
      You are a friendly AI restaurant advisor. Based on the following user preferences and restaurant details,
      provide a short, personalized recommendation. Keep each reason very concise (max 60 characters).
      
      Restaurant Details:
      - Name: ${restaurant.name}
      - Cuisine Types: ${restaurant.types?.join(", ")}
      - Price Level: ${restaurant.priceLevel}
      - Rating: ${restaurant.rating}
      - Features: ${Object.entries(restaurant)
        .filter(([key, value]) => typeof value === "boolean" && value)
        .map(([key]) => key)
        .join(", ")}
      
      User Preferences:
      - Favorite Cuisines: ${preferences?.cuisine_preferences?.join(", ")}
      - Dietary Restrictions: ${preferences?.dietary_restrictions?.join(", ")}
      - Favorite Ingredients: ${preferences?.favorite_ingredients?.join(", ")}
      - Price Range: ${preferences?.price_range}
      - Atmosphere: ${preferences?.atmosphere_preferences?.join(", ")}
      
      Respond with JSON in this exact format:
      {
        "verdict": "MUST VISIT" or "WORTH A TRY" or "SKIP IT",
        "reasons": [
          {
            "emoji": "relevant emoji",
            "text": "very concise reason"
          },
          {
            "emoji": "relevant emoji",
            "text": "very concise reason"
          },
          {
            "emoji": "relevant emoji",
            "text": "very concise reason"
          }
        ]
      }

      Make sure each reason is super concise and punchy. Use relevant emojis that match the reason.
      Example response:
      {
        "verdict": "MUST VISIT",
        "reasons": [
          {
            "emoji": "🌶️",
            "text": "Perfect spice level for your taste"
          },
          {
            "emoji": "🌿",
            "text": "Lots of vegetarian options you'll love"
          },
          {
            "emoji": "💫",
            "text": "Cozy atmosphere matches your vibe"
          }
        ]
      }
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful restaurant advisor that provides concise, personalized recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    const data = await response.json();
    console.log("🤖 OpenAI response:", data);

    const summary = JSON.parse(data.choices[0].message.content);
    console.log("✨ Generated summary:", summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in restaurant-summary function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate summary" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});