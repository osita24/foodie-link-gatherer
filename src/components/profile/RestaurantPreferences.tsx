import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PriceRange, UserPreferences } from "@/types/preferences";
import { Accordion } from "@/components/ui/accordion";
import CuisinePreferences from "./preferences/CuisinePreferences";
import DietaryPreferences from "./preferences/DietaryPreferences";
import SpiceLevelSelector from "./preferences/SpiceLevelSelector";
import PriceRangeSelector from "./preferences/PriceRangeSelector";
import PreferenceCard from "./preferences/PreferenceCard";
import PreferencesProgress from "./preferences/PreferencesProgress";
import PreferencesSection from "./preferences/PreferencesSection";
import { 
  UtensilsCrossed, 
  Leaf, 
  Cherry, 
  Wind,
  Settings2,
  Shell,
  Fish,
  Coffee,
  Soup,
  Pizza,
  Beef,
} from "lucide-react";

const defaultPreferences: UserPreferences = {
  cuisinePreferences: [],
  dietaryRestrictions: [],
  favoriteIngredients: [],
  spiceLevel: 3,
  priceRange: 'moderate',
  atmospherePreferences: [],
  specialConsiderations: "",
};

const RestaurantPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const atmosphereTypes = [
    { name: "Casual Dining", icon: <UtensilsCrossed /> },
    { name: "Fine Dining", icon: <Settings2 /> },
    { name: "Family-Friendly", icon: <UtensilsCrossed /> },
    { name: "Romantic", icon: <Cherry /> },
    { name: "Outdoor Seating", icon: <Wind /> },
    { name: "Quiet/Intimate", icon: <Coffee /> },
    { name: "Lively/Energetic", icon: <Wind /> },
    { name: "Modern/Trendy", icon: <Settings2 /> },
    { name: "Traditional/Classic", icon: <Settings2 /> }
  ];

  const favoriteIngredients = [
    { name: "Chicken", icon: <UtensilsCrossed /> },
    { name: "Beef", icon: <Beef /> },
    { name: "Fish", icon: <Fish /> },
    { name: "Tofu", icon: <Leaf /> },
    { name: "Mushrooms", icon: <Leaf /> },
    { name: "Seafood", icon: <Shell /> },
    { name: "Rice", icon: <Cherry /> },
    { name: "Noodles", icon: <Soup /> },
    { name: "Pizza", icon: <Pizza /> },
    { name: "Fresh Herbs", icon: <Leaf /> }
  ];

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
            .maybeSingle(); // Use maybeSingle instead of single

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
              favoriteIngredients: data.favorite_ingredients || [],
              spiceLevel: data.spice_level || 3,
              priceRange: data.price_range || 'moderate',
              atmospherePreferences: data.atmosphere_preferences || [],
              specialConsiderations: data.special_considerations || "",
            });
          } else {
            console.log("No preferences found, using defaults");
            setPreferences(defaultPreferences);
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
    let total = 5; // Total number of sections

    if (preferences.cuisinePreferences.length > 0) completed++;
    if (preferences.dietaryRestrictions.length > 0) completed++;
    if (preferences.favoriteIngredients.length > 0) completed++;
    if (preferences.atmospherePreferences.length > 0) completed++;
    if (preferences.priceRange) completed++;

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
          favorite_ingredients: preferences.favoriteIngredients,
          spice_level: preferences.spiceLevel,
          price_range: preferences.priceRange,
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

  const toggleArrayPreference = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PreferencesProgress completionPercentage={completionPercentage} />

      <Accordion type="single" collapsible className="w-full space-y-4">
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
          value="ingredients" 
          title="Favorite Ingredients"
          selectedCount={preferences.favoriteIngredients.length}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {favoriteIngredients.map((ingredient) => (
              <PreferenceCard
                key={ingredient.name}
                label={ingredient.name}
                selected={preferences.favoriteIngredients.includes(ingredient.name)}
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  favoriteIngredients: toggleArrayPreference(prev.favoriteIngredients, ingredient.name)
                }))}
                icon={ingredient.icon}
              />
            ))}
          </div>
        </PreferencesSection>

        <PreferencesSection 
          value="atmosphere" 
          title="Atmosphere Preferences"
          selectedCount={preferences.atmospherePreferences.length}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {atmosphereTypes.map((atmosphere) => (
              <PreferenceCard
                key={atmosphere.name}
                label={atmosphere.name}
                selected={preferences.atmospherePreferences.includes(atmosphere.name)}
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  atmospherePreferences: toggleArrayPreference(prev.atmospherePreferences, atmosphere.name)
                }))}
                icon={atmosphere.icon}
              />
            ))}
          </div>
        </PreferencesSection>

        <PreferencesSection 
          value="additional" 
          title="Additional Preferences"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Spice Level Preference</h3>
              <SpiceLevelSelector
                value={preferences.spiceLevel}
                onChange={(value) => setPreferences(prev => ({ ...prev, spiceLevel: value }))}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Price Range Preference</h3>
              <PriceRangeSelector
                value={preferences.priceRange}
                onChange={(value) => setPreferences(prev => ({ ...prev, priceRange: value }))}
              />
            </div>
          </div>
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
