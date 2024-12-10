import { useState, useEffect, useMemo } from 'react';
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
  const [userPreferences, setUserPreferences] = useState<any>(null);

  // Fetch and cache user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        console.log('🔍 Fetching user preferences');
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
        setUserPreferences(preferencesData);

      } catch (error) {
        console.error('❌ Error loading preferences:', error);
        setMatchResult({
          overallScore: 0,
          categories: [],
          loading: false,
          error: 'Failed to load preferences'
        });
      }
    };

    loadPreferences();
  }, []);

  // Memoize match calculations
  useEffect(() => {
    if (!restaurant || !userPreferences) {
      setMatchResult(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      console.log('🔄 Calculating matches for:', restaurant.name);
      const preferences = mapSupabaseToUserPreferences(userPreferences);

      // Calculate all matches in parallel for better performance
      const matches = {
        cuisine: calculateCuisineMatch(restaurant, preferences),
        dietary: calculateDietaryMatch(restaurant, preferences),
        atmosphere: calculateAtmosphereMatch(restaurant, preferences),
        price: calculatePriceMatch(restaurant, preferences)
      };

      console.log('📊 Match calculations:', matches);

      const categories: MatchCategory[] = [
        {
          category: "Cuisine",
          score: matches.cuisine.score,
          description: matches.cuisine.description,
          icon: "🍽️"
        },
        {
          category: "Dietary",
          score: matches.dietary.score,
          description: matches.dietary.description,
          icon: "🥗"
        },
        {
          category: "Atmosphere",
          score: matches.atmosphere.score,
          description: matches.atmosphere.description,
          icon: "✨"
        },
        {
          category: "Price",
          score: matches.price.score,
          description: matches.price.description,
          icon: "💰"
        }
      ];

      // Weight the scores based on importance
      const weightedScore = Math.round(
        (matches.cuisine.score * 0.35) +
        (matches.dietary.score * 0.35) +
        (matches.atmosphere.score * 0.15) +
        (matches.price.score * 0.15)
      );

      console.log('✨ Final weighted score:', weightedScore);

      setMatchResult({
        overallScore: weightedScore,
        categories: categories.sort((a, b) => b.score - a.score), // Sort by score
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
  }, [restaurant, userPreferences]);

  return matchResult;
};