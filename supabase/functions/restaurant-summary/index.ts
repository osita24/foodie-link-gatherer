import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RestaurantFeatures {
  servesBreakfast?: boolean;
  servesBrunch?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  servesVegetarianFood?: boolean;
  servesBeer?: boolean;
  servesWine?: boolean;
  delivery?: boolean;
  dineIn?: boolean;
  takeout?: boolean;
  reservable?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurant, preferences } = await req.json();
    console.log("🏪 Processing restaurant:", restaurant.name);
    console.log("👤 User preferences:", preferences);

    // Calculate match scores for different aspects
    const dietaryScore = calculateDietaryScore(restaurant, preferences);
    const cuisineScore = calculateCuisineScore(restaurant, preferences);
    const priceScore = calculatePriceScore(restaurant, preferences);
    const atmosphereScore = calculateAtmosphereScore(restaurant, preferences);
    
    // Weight the scores
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

    // Generate verdict and reasons
    const { verdict, reasons } = generateVerdict(
      weightedScore,
      restaurant,
      preferences,
      { dietaryScore, cuisineScore, priceScore, atmosphereScore }
    );

    console.log("✨ Generated verdict:", verdict);
    console.log("📝 Generated reasons:", reasons);

    return new Response(JSON.stringify({ verdict, reasons }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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

function calculateDietaryScore(restaurant: RestaurantFeatures, preferences: any): number {
  let score = 70; // Base score

  if (preferences.dietary_restrictions?.includes('vegetarian')) {
    if (restaurant.servesVegetarianFood) {
      score += 30;
    } else {
      score -= 40; // Major penalty if vegetarian options aren't available
    }
  }

  return Math.min(100, Math.max(0, score));
}

function calculateCuisineScore(restaurant: any, preferences: any): number {
  if (!preferences.cuisine_preferences?.length) return 75;

  const restaurantCuisines = restaurant.types?.filter((type: string) => 
    type.includes('cuisine') || type.includes('food')
  ) || [];

  const matchCount = restaurantCuisines.filter((cuisine: string) =>
    preferences.cuisine_preferences.some((pref: string) => 
      cuisine.toLowerCase().includes(pref.toLowerCase())
    )
  ).length;

  return matchCount > 0 ? Math.min(100, 70 + (matchCount * 15)) : 60;
}

function calculatePriceScore(restaurant: any, preferences: any): number {
  if (!preferences.price_range) return 75;

  const priceMap: Record<string, number[]> = {
    'budget': [1],
    'moderate': [1, 2],
    'upscale': [2, 3],
    'luxury': [3, 4]
  };

  const preferredLevels = priceMap[preferences.price_range];
  const restaurantLevel = restaurant.priceLevel || 2;

  return preferredLevels.includes(restaurantLevel) ? 95 : 60;
}

function calculateAtmosphereScore(restaurant: RestaurantFeatures, preferences: any): number {
  if (!preferences.atmosphere_preferences?.length) return 75;

  let score = 70;
  const features = {
    'Fine Dining': restaurant.reservable,
    'Casual Dining': restaurant.dineIn,
    'Quick Bites': restaurant.takeout,
    'Delivery': restaurant.delivery,
    'Bar Scene': restaurant.servesBeer || restaurant.servesWine
  };

  preferences.atmosphere_preferences.forEach((pref: string) => {
    if (features[pref]) {
      score += 15;
    }
  });

  return Math.min(100, score);
}

function generateVerdict(
  weightedScore: number,
  restaurant: any,
  preferences: any,
  scores: { dietaryScore: number; cuisineScore: number; priceScore: number; atmosphereScore: number }
): { verdict: string; reasons: Array<{ emoji: string; text: string }> } {
  const reasons: Array<{ emoji: string; text: string }> = [];

  // Add dietary reason if relevant
  if (preferences.dietary_restrictions?.length) {
    if (scores.dietaryScore >= 90) {
      reasons.push({ emoji: "🌱", text: "Perfect for your dietary preferences" });
    } else if (scores.dietaryScore <= 40) {
      reasons.push({ emoji: "⚠️", text: "Limited options for your dietary needs" });
    }
  }

  // Add cuisine match reason
  if (scores.cuisineScore >= 85) {
    reasons.push({ emoji: "🎯", text: "Matches your favorite cuisine perfectly" });
  } else if (scores.cuisineScore >= 70) {
    reasons.push({ emoji: "👍", text: "Similar to cuisines you enjoy" });
  }

  // Add price match reason
  if (scores.priceScore >= 90) {
    reasons.push({ emoji: "💰", text: "Fits your preferred price range" });
  } else if (scores.priceScore <= 60) {
    reasons.push({ emoji: "💸", text: "Outside your usual price range" });
  }

  // Add atmosphere reason
  if (scores.atmosphereScore >= 85) {
    reasons.push({ emoji: "✨", text: "Perfect atmosphere for your style" });
  }

  // Add rating-based reason if high rated
  if (restaurant.rating >= 4.5) {
    reasons.push({ emoji: "⭐", text: "Highly rated by other diners" });
  }

  // Determine verdict based on weighted score
  let verdict: "MUST VISIT" | "WORTH A TRY" | "SKIP IT";
  if (weightedScore >= 85) {
    verdict = "MUST VISIT";
  } else if (weightedScore >= 65) {
    verdict = "WORTH A TRY";
  } else {
    verdict = "SKIP IT";
  }

  // Ensure we have at least 3 reasons
  while (reasons.length < 3) {
    if (restaurant.delivery && !reasons.some(r => r.text.includes("delivery"))) {
      reasons.push({ emoji: "🚚", text: "Offers convenient delivery" });
    } else if (restaurant.reservable && !reasons.some(r => r.text.includes("reservation"))) {
      reasons.push({ emoji: "📅", text: "Easy to make reservations" });
    } else if (restaurant.servesVegetarianFood && !reasons.some(r => r.text.includes("vegetarian"))) {
      reasons.push({ emoji: "🥗", text: "Good vegetarian options available" });
    } else {
      reasons.push({ emoji: "📍", text: "Popular local establishment" });
      break;
    }
  }

  // Limit to top 3 most relevant reasons
  reasons.splice(3);

  return { verdict, reasons };
}