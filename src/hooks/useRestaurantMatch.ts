import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RestaurantDetails } from '@/types/restaurant';
import { mapSupabaseToUserPreferences } from '@/utils/preferencesMapper';
import { 
  calculateCuisineScore, 
  calculateDietaryScore, 
  calculateAtmosphereScore, 
  calculatePriceScore,
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

        // Calculate matches using the utility functions with corrected names
        const cuisineMatch = calculateCuisineScore(restaurant, preferences);
        const dietaryMatch = calculateDietaryScore(restaurant, preferences);
        const atmosphereMatch = calculateAtmosphereScore(restaurant, preferences);
        const priceMatch = calculatePriceScore(restaurant, preferences);

        const categories: MatchCategory[] = [
          {
            category: "Cuisine",
            score: cuisineMatch,
            description: "Based on your cuisine preferences",
            icon: "🍽️"
          },
          {
            category: "Dietary",
            score: dietaryMatch,
            description: "Matches your dietary requirements",
            icon: "🥗"
          },
          {
            category: "Atmosphere",
            score: atmosphereMatch,
            description: "Fits your preferred dining atmosphere",
            icon: "✨"
          },
          {
            category: "Price",
            score: priceMatch,
            description: "Aligns with your budget preferences",
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