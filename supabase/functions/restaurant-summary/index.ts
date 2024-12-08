import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { RestaurantFeatures, UserPreferences, SummaryResponse } from './types';
import { 
  calculateDietaryMatch,
  calculateCuisineMatch,
  calculatePriceMatch,
  calculateAtmosphereMatch
} from './matchCalculators';
import { generateVerdict } from './verdictGenerator';

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

    // Transform restaurant data to match our internal type
    const restaurantFeatures: RestaurantFeatures = {
      name: restaurant.name,
      servesBreakfast: restaurant.servesBreakfast,
      servesBrunch: restaurant.servesBrunch,
      servesLunch: restaurant.servesLunch,
      servesDinner: restaurant.servesDinner,
      servesVegetarianFood: restaurant.servesVegetarianFood,
      servesBeer: restaurant.servesBeer,
      servesWine: restaurant.servesWine,
      delivery: restaurant.delivery,
      dineIn: restaurant.dineIn,
      takeout: restaurant.takeout,
      reservable: restaurant.reservable,
      rating: restaurant.rating,
      priceLevel: restaurant.priceLevel,
      types: restaurant.types,
    };

    // Calculate individual scores
    const dietaryScore = calculateDietaryMatch(restaurantFeatures, preferences);
    const cuisineScore = calculateCuisineMatch(restaurantFeatures, preferences);
    const priceScore = calculatePriceMatch(restaurantFeatures, preferences);
    const atmosphereScore = calculateAtmosphereMatch(restaurantFeatures, preferences);
    
    // Calculate weighted score with priority on dietary and cuisine matches
    const weightedScore = (
      (dietaryScore * 0.35) +    // Dietary is most important
      (cuisineScore * 0.30) +    // Cuisine type is second
      (priceScore * 0.20) +      // Price is third
      (atmosphereScore * 0.15)   // Atmosphere is fourth
    );

    console.log("📊 Calculated scores:", {
      dietary: dietaryScore,
      cuisine: cuisineScore,
      price: priceScore,
      atmosphere: atmosphereScore,
      weighted: weightedScore
    });

    // Generate personalized verdict and reasons
    const summary = generateVerdict(
      weightedScore,
      restaurantFeatures,
      preferences,
      { dietaryScore, cuisineScore, priceScore, atmosphereScore }
    );

    console.log("✨ Generated verdict:", summary.verdict);
    console.log("📝 Generated reasons:", summary.reasons);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("❌ Error in restaurant-summary function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate summary",
        verdict: "WORTH A TRY",
        reasons: [
          { emoji: "⚠️", text: "We're having trouble analyzing this restaurant right now" },
          { emoji: "🔄", text: "Please try refreshing the page" },
          { emoji: "⏳", text: "Our recommendation system is taking a quick break" }
        ]
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});