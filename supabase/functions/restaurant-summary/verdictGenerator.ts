import { RestaurantFeatures, UserPreferences, SummaryResponse, Reason } from './types.ts';

interface Scores {
  dietaryScore: number;
  cuisineScore: number;
  priceScore: number;
  atmosphereScore: number;
}

export function generateVerdict(
  weightedScore: number,
  restaurant: RestaurantFeatures,
  preferences: UserPreferences,
  scores: Scores
): SummaryResponse {
  const reasons: Reason[] = [];
  
  // Dietary-based reasons (highest priority)
  if (preferences.dietary_restrictions?.length) {
    if (scores.dietaryScore >= 90) {
      const restriction = preferences.dietary_restrictions[0];
      reasons.push({ 
        emoji: "✅", 
        text: `Perfect for your ${restriction} dietary preferences` 
      });
    } else if (scores.dietaryScore <= 40) {
      reasons.push({ 
        emoji: "⚠️", 
        text: `Limited options for your ${preferences.dietary_restrictions.join(' and ')} requirements` 
      });
    }
  }

  // Cuisine match reasons
  if (scores.cuisineScore >= 85) {
    const cuisineMatch = preferences.cuisine_preferences?.[0];
    reasons.push({ 
      emoji: "🎯", 
      text: `Matches your love for ${cuisineMatch} cuisine perfectly` 
    });
  } else if (scores.cuisineScore >= 70) {
    reasons.push({ 
      emoji: "👍", 
      text: `Similar to your preferred ${preferences.cuisine_preferences?.[0]} cuisine style` 
    });
  }

  // Price match reasons
  if (preferences.price_range) {
    if (scores.priceScore >= 90) {
      reasons.push({ 
        emoji: "💰", 
        text: `Fits your ${preferences.price_range} budget preference perfectly` 
      });
    } else if (scores.priceScore <= 60) {
      reasons.push({ 
        emoji: "💸", 
        text: `${restaurant.priceLevel && restaurant.priceLevel > 2 ? 'More expensive' : 'More affordable'} than your usual ${preferences.price_range} preference` 
      });
    }
  }

  // Atmosphere match
  if (preferences.atmosphere_preferences?.length && scores.atmosphereScore >= 85) {
    const atmosphereMatch = preferences.atmosphere_preferences[0];
    reasons.push({ 
      emoji: "✨", 
      text: `Perfect for your preferred ${atmosphereMatch.toLowerCase()} experience` 
    });
  }

  // Add protein preference match if relevant
  if (preferences.favorite_proteins?.length && restaurant.types?.some(t => 
    preferences.favorite_proteins?.some(p => t.toLowerCase().includes(p.toLowerCase()))
  )) {
    reasons.push({ 
      emoji: "🥩", 
      text: `Known for ${preferences.favorite_proteins[0]}, one of your favorite proteins` 
    });
  }

  // High rating mention if it's exceptional
  if (reasons.length < 3 && restaurant.rating && restaurant.rating >= 4.5) {
    reasons.push({ 
      emoji: "⭐", 
      text: `Exceptional ${restaurant.rating}/5 rating from diners with similar tastes` 
    });
  }

  // Determine verdict based on weighted score
  let verdict: SummaryResponse['verdict'];
  if (weightedScore >= 85) {
    verdict = "MUST VISIT";
  } else if (weightedScore >= 65) {
    verdict = "WORTH A TRY";
  } else {
    verdict = "SKIP IT";
  }

  // Ensure we have at least 2 reasons
  while (reasons.length < 2) {
    if (restaurant.servesVegetarianFood && !reasons.some(r => r.text.includes("vegetarian"))) {
      reasons.push({ 
        emoji: "🥗", 
        text: `Offers diverse vegetarian options that match your preferences` 
      });
    } else if (restaurant.delivery && preferences.atmosphere_preferences?.includes('Delivery')) {
      reasons.push({ 
        emoji: "🚚", 
        text: `Offers delivery, matching your dining preferences` 
      });
    } else if (restaurant.reservable && preferences.atmosphere_preferences?.includes('Fine Dining')) {
      reasons.push({ 
        emoji: "📅", 
        text: `Takes reservations for a refined dining experience` 
      });
    } else {
      break;
    }
  }

  // Limit to top 3 most relevant reasons
  reasons.splice(3);

  return { verdict, reasons };
}