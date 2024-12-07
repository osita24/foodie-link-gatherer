import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PriceRange, UserPreferences } from "@/types/preferences";
import { Accordion } from "@/components/ui/accordion";
import CuisinePreferences from "./preferences/CuisinePreferences";
import DietaryPreferences from "./preferences/DietaryPreferences";
import PreferencesProgress from "./preferences/PreferencesProgress";
import PreferencesSection from "./preferences/PreferencesSection";
import AtmospherePreferences from "./preferences/AtmospherePreferences";
import AvoidancePreferences from "./preferences/AvoidancePreferences";

const defaultPreferences: UserPreferences = {
  cuisinePreferences: [],
  dietaryRestrictions: [],
  foodsToAvoid: [],
  atmospherePreferences: [],
  favoriteIngredients: [],
  spiceLevel: 3,
  priceRange: 'moderate',
  specialConsiderations: "",
};

const RestaurantPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("Loading preferences for user:", user.id);
          const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error("Error loading preferences:", error);
            toast({
              title: "Error",
              description: "Failed to load preferences. Please try again.",
              variant: "destructive",
            });
            return;
          }

          if (data) {
            console.log("Loaded preferences:", data);
            setPreferences({
              cuisinePreferences: data.cuisine_preferences || [],
              dietaryRestrictions: data.dietary_restrictions || [],
              foodsToAvoid: data.favorite_ingredients || [], // Using this field for foods to avoid
              atmospherePreferences: data.atmosphere_preferences || [],
              favoriteIngredients: [],
              spiceLevel: data.spice_level || 3,
              priceRange: data.price_range || 'moderate',
              specialConsiderations: data.special_considerations || "",
            });
          }
        }
      } catch (error) {
        console.error("Error in loadPreferences:", error);
        toast({
          title: "Error",
          description: "Failed to load preferences. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadPreferences();
  }, [toast]);

  useEffect(() => {
    // Calculate completion percentage
    let completed = 0;
    let total = 4; // Updated to match the four main sections

    if (preferences.cuisinePreferences.length > 0) completed++;
    if (preferences.dietaryRestrictions.length > 0) completed++;
    if (preferences.foodsToAvoid.length > 0) completed++;
    if (preferences.atmospherePreferences.length > 0) completed++;

    setCompletionPercentage((completed / total) * 100);
  }, [preferences]);

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          cuisine_preferences: preferences.cuisinePreferences,
          dietary_restrictions: preferences.dietaryRestrictions,
          favorite_ingredients: preferences.foodsToAvoid, // Using this field for foods to avoid
          atmosphere_preferences: preferences.atmospherePreferences,
          special_considerations: preferences.specialConsiderations,
        });

      if (error) throw error;

      toast({
        title: "Preferences saved",
        description: "Your restaurant preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PreferencesProgress completionPercentage={completionPercentage} />

      <Accordion type="single" collapsible className="w-full space-y-4">
        <PreferencesSection 
          value="dietary" 
          title="Dietary Preferences"
          selectedCount={preferences.dietaryRestrictions.length}
        >
          <DietaryPreferences
            selected={preferences.dietaryRestrictions}
            onChange={(restrictions) => setPreferences(prev => ({ ...prev, dietaryRestrictions: restrictions }))}
          />
        </PreferencesSection>

        <PreferencesSection 
          value="cuisines" 
          title="Cuisine Preferences"
          selectedCount={preferences.cuisinePreferences.length}
        >
          <CuisinePreferences 
            selected={preferences.cuisinePreferences}
            onChange={(cuisines) => setPreferences(prev => ({ ...prev, cuisinePreferences: cuisines }))}
          />
        </PreferencesSection>

        <PreferencesSection 
          value="avoidance" 
          title="Foods to Avoid"
          selectedCount={preferences.foodsToAvoid.length}
        >
          <AvoidancePreferences
            selected={preferences.foodsToAvoid}
            onChange={(items) => setPreferences(prev => ({ ...prev, foodsToAvoid: items }))}
          />
        </PreferencesSection>

        <PreferencesSection 
          value="atmosphere" 
          title="Atmosphere Preferences"
          selectedCount={preferences.atmospherePreferences.length}
        >
          <AtmospherePreferences
            selected={preferences.atmospherePreferences}
            onChange={(atmospheres) => setPreferences(prev => ({ ...prev, atmospherePreferences: atmospheres }))}
          />
        </PreferencesSection>
      </Accordion>

      <Button 
        onClick={handleSave} 
        className="w-full md:w-auto"
        disabled={completionPercentage === 0}
      >
        Save Preferences
      </Button>
    </div>
  );
};

export default RestaurantPreferences;