import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences } from '@/types/preferences';
import { RestaurantDetails } from '@/types/restaurant';

interface MatchCategory {
  category: string;
  score: number;
  description: string;
  icon: string;
}

interface MatchResult {
  overallScore: number;
  categories: MatchCategory[];
  loading: boolean;
  error: string | null;
}

export const useRestaurantMatch = (restaurant: RestaurantDetails | null): MatchResult => {
  const [matchResult, setMatchResult] = useState<MatchResult>({
    overallScore: 0,
    categories: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const calculateMatch = async () => {
      if (!restaurant) {
        setMatchResult(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        console.log('🔍 Fetching user preferences for match calculation');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('❌ No authenticated user found');
          setMatchResult(prev => ({ ...prev, loading: false }));
          return;
        }

        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching preferences:', error);
          throw error;
        }

        console.log('✅ User preferences loaded:', preferences);

        // Calculate cuisine match
        const cuisineMatch = calculateCuisineMatch(restaurant, preferences);
        
        // Calculate dietary match
        const dietaryMatch = calculateDietaryMatch(restaurant, preferences);
        
        // Calculate atmosphere match
        const atmosphereMatch = calculateAtmosphereMatch(restaurant, preferences);
        
        // Calculate price match
        const priceMatch = calculatePriceMatch(restaurant, preferences);

        const categories: MatchCategory[] = [
          {
            category: "Cuisine",
            score: cuisineMatch.score,
            description: cuisineMatch.description,
            icon: "🍽️"
          },
          {
            category: "Dietary",
            score: dietaryMatch.score,
            description: dietaryMatch.description,
            icon: "🥗"
          },
          {
            category: "Atmosphere",
            score: atmosphereMatch.score,
            description: atmosphereMatch.description,
            icon: "✨"
          },
          {
            category: "Price",
            score: priceMatch.score,
            description: priceMatch.description,
            icon: "💰"
          }
        ];

        const overallScore = Math.round(
          categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length
        );

        console.log('✨ Match calculation complete:', { overallScore, categories });

        setMatchResult({
          overallScore,
          categories,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('❌ Error calculating match:', error);
        setMatchResult({
          overallScore: 0,
          categories: [],
          loading: false,
          error: 'Failed to calculate match score'
        });
      }
    };

    calculateMatch();
  }, [restaurant]);

  return matchResult;
};

// Helper functions for match calculations
const calculateCuisineMatch = (restaurant: RestaurantDetails, preferences: UserPreferences) => {
  // Default high score if user has no preferences
  if (!preferences.cuisinePreferences?.length) {
    return { score: 85, description: "Based on popular cuisine type" };
  }

  const restaurantCuisines = restaurant.types?.filter(type => 
    type.includes('cuisine') || type.includes('food')
  ) || [];

  const matchCount = restaurantCuisines.filter(cuisine =>
    preferences.cuisinePreferences.some(pref => 
      cuisine.toLowerCase().includes(pref.toLowerCase())
    )
  ).length;

  const score = matchCount > 0 
    ? Math.min(100, 70 + (matchCount * 10))
    : 70;

  return {
    score,
    description: matchCount > 0 
      ? `Matches ${matchCount} of your preferred cuisines`
      : "Popular cuisine type that you might enjoy"
  };
};

const calculateDietaryMatch = (restaurant: RestaurantDetails, preferences: UserPreferences) => {
  if (!preferences.dietaryRestrictions?.length) {
    return { score: 90, description: "No dietary restrictions specified" };
  }

  // Check if restaurant has relevant attributes
  const hasVegetarian = restaurant.servesVegetarianFood;
  const score = hasVegetarian ? 95 : 75;

  return {
    score,
    description: hasVegetarian 
      ? "Offers vegetarian options"
      : "Limited information about dietary options"
  };
};

const calculateAtmosphereMatch = (restaurant: RestaurantDetails, preferences: UserPreferences) => {
  if (!preferences.atmospherePreferences?.length) {
    return { score: 85, description: "Based on general atmosphere" };
  }

  // Map restaurant attributes to atmosphere preferences
  const atmosphereAttributes = [
    restaurant.reservable && 'Fine Dining',
    restaurant.dineIn && 'Casual Dining',
    // Add more mappings as needed
  ].filter(Boolean);

  const matchCount = atmosphereAttributes.filter(attr =>
    preferences.atmospherePreferences.includes(attr as string)
  ).length;

  const score = matchCount > 0 
    ? Math.min(100, 75 + (matchCount * 10))
    : 75;

  return {
    score,
    description: matchCount > 0
      ? `Matches ${matchCount} of your preferred atmosphere types`
      : "General atmosphere rating"
  };
};

const calculatePriceMatch = (restaurant: RestaurantDetails, preferences: UserPreferences) => {
  if (!preferences.priceRange) {
    return { score: 85, description: "Based on average pricing" };
  }

  // Map price levels to preference ranges
  const priceMap: Record<string, number[]> = {
    'budget': [1],
    'moderate': [1, 2],
    'upscale': [2, 3],
    'luxury': [3, 4]
  };

  const preferredLevels = priceMap[preferences.priceRange];
  const restaurantLevel = restaurant.priceLevel || 2;

  const score = preferredLevels.includes(restaurantLevel) ? 95 : 75;

  return {
    score,
    description: score > 90 
      ? "Matches your preferred price range"
      : "Slightly outside your preferred price range"
  };
};