import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PriceRange, UserPreferences } from "@/types/preferences";
import CuisinePreferences from "./preferences/CuisinePreferences";
import DietaryPreferences from "./preferences/DietaryPreferences";
import SpiceLevelSelector from "./preferences/SpiceLevelSelector";
import PriceRangeSelector from "./preferences/PriceRangeSelector";
import PreferenceCard from "./preferences/PreferenceCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { 
  UtensilsCrossed, 
  Leaf, 
  Cherry, 
  Wind,
  Settings2
} from "lucide-react";

const RestaurantPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>({
    cuisinePreferences: [],
    dietaryRestrictions: [],
    favoriteIngredients: [],
    spiceLevel: 3,
    priceRange: 'moderate',
    atmospherePreferences: [],
    specialConsiderations: "",
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);

  const atmosphereTypes = [
    { name: "Casual Dining", icon: <UtensilsCrossed /> },
    { name: "Fine Dining", icon: <UtensilsCrossed /> },
    { name: "Family-Friendly", icon: <UtensilsCrossed /> },
    { name: "Romantic", icon: <Cherry /> },
    { name: "Outdoor Seating", icon: <Wind /> },
    { name: "Quiet/Intimate", icon: <Wind /> },
    { name: "Lively/Energetic", icon: <Wind /> },
    { name: "Modern/Trendy", icon: <Settings2 /> },
    { name: "Traditional/Classic", icon: <Settings2 /> }
  ];

  const favoriteIngredients = [
    { name: "Chicken", icon: <UtensilsCrossed /> },
    { name: "Beef", icon: <UtensilsCrossed /> },
    { name: "Fish", icon: <UtensilsCrossed /> },
    { name: "Tofu", icon: <Leaf /> },
    { name: "Mushrooms", icon: <Leaf /> },
    { name: "Avocado", icon: <Cherry /> },
    { name: "Cheese", icon: <Cherry /> },
    { name: "Rice", icon: <Cherry /> },
    { name: "Noodles", icon: <UtensilsCrossed /> },
    { name: "Eggs", icon: <Cherry /> },
    { name: "Shrimp", icon: <UtensilsCrossed /> },
    { name: "Lamb", icon: <UtensilsCrossed /> },
    { name: "Garlic", icon: <Leaf /> },
    { name: "Ginger", icon: <Leaf /> },
    { name: "Tomatoes", icon: <Cherry /> },
    { name: "Fresh Herbs", icon: <Leaf /> }
  ];

  useEffect(() => {
    const loadPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setPreferences({
            cuisinePreferences: data.cuisine_preferences || [],
            dietaryRestrictions: data.dietary_restrictions || [],
            favoriteIngredients: data.favorite_ingredients || [],
            spiceLevel: data.spice_level || 3,
            priceRange: data.price_range || 'moderate',
            atmospherePreferences: data.atmosphere_preferences || [],
            specialConsiderations: data.special_considerations || "",
          });
        }
      }
    };

    loadPreferences();
  }, []);

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
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Complete Your Taste Profile</h2>
        <Progress value={completionPercentage} className="h-2" />
        <p className="text-sm text-gray-500">
          {completionPercentage === 100 
            ? "All preferences set! Feel free to update them anytime."
            : "Fill out your preferences to get better restaurant recommendations"}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="cuisines" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">Cuisine Preferences</span>
              {preferences.cuisinePreferences.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({preferences.cuisinePreferences.length} selected)
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <CuisinePreferences 
              selected={preferences.cuisinePreferences}
              onChange={(cuisines) => setPreferences(prev => ({ ...prev, cuisinePreferences: cuisines }))}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dietary" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">Dietary Preferences</span>
              {preferences.dietaryRestrictions.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({preferences.dietaryRestrictions.length} selected)
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <DietaryPreferences
              selected={preferences.dietaryRestrictions}
              onChange={(restrictions) => setPreferences(prev => ({ ...prev, dietaryRestrictions: restrictions }))}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ingredients" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">Favorite Ingredients</span>
              {preferences.favoriteIngredients.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({preferences.favoriteIngredients.length} selected)
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="atmosphere" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">Atmosphere Preferences</span>
              {preferences.atmospherePreferences.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({preferences.atmospherePreferences.length} selected)
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="additional" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-4">
            <span className="text-lg">Additional Preferences</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
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
          </AccordionContent>
        </AccordionItem>
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
