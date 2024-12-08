import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserPreferences, PriceRange } from "@/types/preferences";
import PreferencesProgress from "./preferences/PreferencesProgress";
import PreferencesForm from "./preferences/PreferencesForm";
import PreferencesSaveButton from "./preferences/PreferencesSaveButton";

const defaultPreferences: UserPreferences = {
  cuisinePreferences: [],
  dietaryRestrictions: [],
  foodsToAvoid: [],
  atmospherePreferences: [],
  favoriteIngredients: [],
  favoriteProteins: [],
  spiceLevel: 3,
  priceRange: 'moderate' as PriceRange,
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
        if (!user) {
          console.error("No authenticated user found");
          return;
        }

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
            foodsToAvoid: data.favorite_ingredients || [],
            atmospherePreferences: data.atmosphere_preferences || [],
            favoriteIngredients: [],
            favoriteProteins: data.favorite_proteins || [],
            spiceLevel: data.spice_level || 3,
            priceRange: data.price_range || 'moderate',
            specialConsiderations: data.special_considerations || "",
          });
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
    let completed = 0;
    let total = 5; // Updated to include protein preferences

    if (preferences.cuisinePreferences.length > 0) completed++;
    if (preferences.dietaryRestrictions.length > 0) completed++;
    if (preferences.foodsToAvoid.length > 0) completed++;
    if (preferences.atmospherePreferences.length > 0) completed++;
    if (preferences.favoriteProteins.length > 0) completed++;

    setCompletionPercentage((completed / total) * 100);
  }, [preferences]);

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      console.log("Saving preferences for user:", user.id);

      const { data: existingPrefs, error: fetchError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const preferencesData = {
        cuisine_preferences: preferences.cuisinePreferences,
        dietary_restrictions: preferences.dietaryRestrictions,
        favorite_ingredients: preferences.foodsToAvoid,
        atmosphere_preferences: preferences.atmospherePreferences,
        favorite_proteins: preferences.favoriteProteins,
        special_considerations: preferences.specialConsiderations,
      };

      let result;
      
      if (existingPrefs) {
        console.log("Updating existing preferences");
        result = await supabase
          .from('user_preferences')
          .update(preferencesData)
          .eq('user_id', user.id);
      } else {
        console.log("Creating new preferences record");
        result = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...preferencesData,
          });
      }

      if (result.error) throw result.error;

      console.log("Preferences saved successfully");
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
    <div className="space-y-6 w-full px-4 md:px-0 md:max-w-3xl mx-auto pb-20">
      <PreferencesProgress completionPercentage={completionPercentage} />
      <PreferencesForm 
        preferences={preferences}
        onChange={setPreferences}
      />
      <PreferencesSaveButton 
        onClick={handleSave}
        disabled={completionPercentage === 0}
      />
    </div>
  );
};

export default RestaurantPreferences;