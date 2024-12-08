import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { RestaurantFeatures, UserPreferences, SummaryResponse } from "./types.ts";
import {
  calculateDietaryScore,
  calculateCuisineScore,
  calculateProteinScore,
  calculatePriceScore,
  calculateAtmosphereScore
} from "./matchCalculators.ts";
import { generateVerdict } from "./verdictGenerator.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurant, preferences } = await req.json();
    console.log("🏪 Processing restaurant:", restaurant.name);
    console.log("👤 User preferences:", preferences);

    // Calculate match scores
    const scores = {
      dietaryScore: calculateDietaryScore(restaurant, preferences),
      cuisineScore: calculateCuisineScore(restaurant, preferences),
      proteinScore: calculateProteinScore(restaurant, preferences),
      priceScore: calculatePriceScore(restaurant, preferences),
      atmosphereScore: calculateAtmosphereScore(restaurant, preferences)
    };

    console.log("📊 Calculated scores:", scores);

    // Generate personalized verdict and reasons
    const { verdict, reasons } = generateVerdict(restaurant, preferences, scores);

    console.log("✨ Generated verdict:", verdict);
    console.log("📝 Generated reasons:", reasons);

    return new Response(
      JSON.stringify({ verdict, reasons }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("❌ Error in restaurant-summary function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate summary" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});