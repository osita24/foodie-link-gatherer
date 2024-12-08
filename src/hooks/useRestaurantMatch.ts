import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RestaurantDetails } from '@/types/restaurant';
import { mapSupabaseToUserPreferences } from '@/utils/preferencesMapper';
import { 
  calculateCuisineMatch, 
  calculateDietaryMatch, 
  calculateAtmosphereMatch, 
  calculatePriceMatch,
} from './restaurant-match/matchCalculators';

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

        const { data: preferencesData, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching preferences:', error);
          throw error;
        }

        console.log('✅ User preferences loaded:', preferencesData);
        
        const preferences = mapSupabaseToUserPreferences(preferencesData);

        // Calculate individual matches
        const cuisineMatch = calculateCuisineMatch(restaurant, preferences);
        const dietaryMatch = calculateDietaryMatch(restaurant, preferences);
        const atmosphereMatch = calculateAtmosphereMatch(restaurant, preferences);
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

        // Calculate weighted average
        const weights = {
          cuisine: 0.35,
          dietary: 0.3,
          atmosphere: 0.2,
          price: 0.15
        };

        const overallScore = Math.round(
          (cuisineMatch.score * weights.cuisine) +
          (dietaryMatch.score * weights.dietary) +
          (atmosphereMatch.score * weights.atmosphere) +
          (priceMatch.score * weights.price)
        );

        console.log('✨ Match calculation complete:', { 
          overallScore, 
          cuisineScore: cuisineMatch.score,
          dietaryScore: dietaryMatch.score,
          atmosphereScore: atmosphereMatch.score,
          priceScore: priceMatch.score
        });

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