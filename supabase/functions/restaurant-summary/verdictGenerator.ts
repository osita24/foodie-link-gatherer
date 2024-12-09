import { RestaurantFeatures, UserPreferences } from "./types.ts";
import { MatchScores, Verdict, VerdictResult } from "./types/verdictTypes.ts";

function generateMustVisitReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];
  
  // Add cuisine match with specific details
  const matchingCuisine = preferences.cuisine_preferences?.find(cuisine => 
    restaurant.types?.some(type => type.toLowerCase().includes(cuisine.toLowerCase()))
  );
  
  if (matchingCuisine) {
    reasons.push({
      emoji: "🎯",
      text: `Perfect match for your love of ${matchingCuisine.toLowerCase()} cuisine - you'll feel right at home here`
    });
  }

  // Add dietary match with specific accommodations
  if (preferences.dietary_restrictions?.length) {
    const restriction = preferences.dietary_restrictions[0];
    if (restaurant.servesVegetarianFood && restriction.toLowerCase().includes('vegetarian')) {
      reasons.push({
        emoji: "🥗",
        text: `Extensive vegetarian menu that aligns perfectly with your dietary preferences`
      });
    } else if (restriction.toLowerCase().includes('gluten')) {
      reasons.push({
        emoji: "✨",
        text: `They're known for accommodating gluten-free diets with dedicated menu options`
      });
    }
  }

  // Add protein preference match
  if (preferences.favorite_proteins?.length) {
    const protein = preferences.favorite_proteins[0].toLowerCase();
    reasons.push({
      emoji: "🍖",
      text: `Their ${protein} dishes are highly rated - perfect for your protein preference`
    });
  }

  // Add atmosphere match
  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0];
    const atmosphereEmoji = atmosphere === 'Fine Dining' ? "✨" : 
                          atmosphere === 'Casual Dining' ? "🪑" : 
                          atmosphere === 'Bar Scene' ? "🍸" : "🏠";
    reasons.push({
      emoji: atmosphereEmoji,
      text: `The ${atmosphere.toLowerCase()} atmosphere matches your preferred dining style perfectly`
    });
  }

  // Add rating context if excellent
  if (restaurant.rating && restaurant.rating >= 4.3) {
    reasons.push({
      emoji: "⭐",
      text: `Exceptional ${restaurant.rating}/5 rating from ${restaurant.userRatingsTotal || 'many'} diners who share your taste`
    });
  }

  return reasons.slice(0, 3);
}

function generateWorthTryingReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  // Add personalized rating context
  if (restaurant.rating) {
    const ratingText = restaurant.rating >= 4.0 
      ? `Strong ${restaurant.rating}/5 rating from the community - worth exploring`
      : `Decent ${restaurant.rating}/5 rating - could be a hidden gem`;
    reasons.push({
      emoji: "⭐",
      text: ratingText
    });
  }

  // Add cuisine exploration suggestion
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0].toLowerCase();
    reasons.push({
      emoji: "🍽️",
      text: `While different from your usual ${preferredCuisine} spots, their menu has dishes that match your taste profile`
    });
  }

  // Add specific dietary accommodation details
  if (preferences.dietary_restrictions?.length) {
    const restriction = preferences.dietary_restrictions[0];
    reasons.push({
      emoji: "✔️",
      text: `They're experienced in accommodating ${restriction.toLowerCase()} diets with careful preparation`
    });
  }

  // Add price value proposition
  if (restaurant.priceLevel && preferences.price_range) {
    const priceMatch = preferences.price_range === 
      (['budget', 'moderate'].includes(preferences.price_range) ? 
        (restaurant.priceLevel <= 2 ? 'match' : 'higher') : 
        (restaurant.priceLevel >= 3 ? 'match' : 'lower'));
    
    reasons.push({
      emoji: "💰",
      text: priceMatch === 'match' 
        ? `Pricing aligns perfectly with your ${preferences.price_range.toLowerCase()} dining preference`
        : `${priceMatch === 'higher' ? 'A bit pricier' : 'More affordable'} than your usual spots, but could be worth it`
    });
  }

  return reasons.slice(0, 3);
}

function generateSkipItReasons(restaurant: RestaurantFeatures, preferences: UserPreferences): Array<{ emoji: string; text: string }> {
  const reasons = [];

  // Add specific dietary warning
  if (preferences.dietary_restrictions?.length && !restaurant.servesVegetarianFood) {
    const restriction = preferences.dietary_restrictions[0];
    reasons.push({
      emoji: "⚠️",
      text: `Very limited options for your ${restriction.toLowerCase()} dietary needs - might be challenging`
    });
  }

  // Add detailed cuisine mismatch explanation
  if (preferences.cuisine_preferences?.length) {
    const preferredCuisine = preferences.cuisine_preferences[0].toLowerCase();
    reasons.push({
      emoji: "🍽️",
      text: `Their cuisine is quite different from your preferred ${preferredCuisine} style - might not satisfy your cravings`
    });
  }

  // Add specific atmosphere mismatch
  if (preferences.atmosphere_preferences?.length) {
    const atmosphere = preferences.atmosphere_preferences[0].toLowerCase();
    reasons.push({
      emoji: "🏠",
      text: `The vibe here differs significantly from your preferred ${atmosphere} setting - might not be what you're looking for`
    });
  }

  // Add constructive alternative suggestion
  reasons.push({
    emoji: "💡",
    text: `We can suggest nearby restaurants that better match your specific preferences and dietary needs`
  });

  return reasons.slice(0, 3);
}

export function generateVerdict(
  restaurant: RestaurantFeatures,
  preferences: UserPreferences,
  scores: MatchScores
): VerdictResult {
  const weightedScore = (
    (scores.dietaryScore * 0.35) +
    (scores.cuisineScore * 0.25) +
    (scores.proteinScore * 0.20) +
    (scores.atmosphereScore * 0.10) +
    (scores.priceScore * 0.10)
  );

  const hasDietaryRestrictions = preferences.dietary_restrictions?.length > 0;
  const meetsRestrictions = scores.dietaryScore >= 70;

  let verdict: Verdict;
  let reasons: Array<{ emoji: string; text: string }>;

  if (hasDietaryRestrictions && !meetsRestrictions) {
    verdict = "SKIP IT";
    reasons = generateSkipItReasons(restaurant, preferences);
  } else if (weightedScore >= 85) {
    verdict = "MUST VISIT";
    reasons = generateMustVisitReasons(restaurant, preferences);
  } else if (weightedScore >= 65) {
    verdict = "WORTH A TRY";
    reasons = generateWorthTryingReasons(restaurant, preferences);
  } else {
    verdict = "SKIP IT";
    reasons = generateSkipItReasons(restaurant, preferences);
  }

  return { verdict, reasons };
}