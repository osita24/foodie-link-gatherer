import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PriceRange, UserPreferences } from "@/types/preferences";
import CuisinePreferences from "./preferences/CuisinePreferences";
import DietaryPreferences from "./preferences/DietaryPreferences";
import { Checkbox } from "../ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

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
    "Casual Dining", "Fine Dining", "Family-Friendly",
    "Romantic", "Outdoor Seating", "Quiet/Intimate",
    "Lively/Energetic", "Modern/Trendy", "Traditional/Classic"
  ];

  const favoriteIngredients = [
    "Chicken", "Beef", "Fish", "Tofu",
    "Mushrooms", "Avocado", "Cheese", "Rice",
    "Noodles", "Eggs", "Shrimp", "Lamb",
    "Garlic", "Ginger", "Tomatoes", "Fresh Herbs"
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
                <div key={ingredient} className="flex items-center space-x-3 bg-accent/20 p-3 rounded-lg hover:bg-accent/30 transition-colors">
                  <Checkbox 
                    id={ingredient}
                    checked={preferences.favoriteIngredients.includes(ingredient)}
                    onCheckedChange={() => setPreferences(prev => ({
                      ...prev,
                      favoriteIngredients: toggleArrayPreference(prev.favoriteIngredients, ingredient)
                    }))}
                  />
                  <Label htmlFor={ingredient} className="cursor-pointer">{ingredient}</Label>
                </div>
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
                <div key={atmosphere} className="flex items-center space-x-3 bg-accent/20 p-3 rounded-lg hover:bg-accent/30 transition-colors">
                  <Checkbox 
                    id={atmosphere}
                    checked={preferences.atmospherePreferences.includes(atmosphere)}
                    onCheckedChange={() => setPreferences(prev => ({
                      ...prev,
                      atmospherePreferences: toggleArrayPreference(prev.atmospherePreferences, atmosphere)
                    }))}
                  />
                  <Label htmlFor={atmosphere} className="cursor-pointer">{atmosphere}</Label>
                </div>
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
              <div className="space-y-4">
                <Slider
                  value={[preferences.spiceLevel]}
                  onValueChange={([value]) => setPreferences(prev => ({ ...prev, spiceLevel: value }))}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Mild</span>
                  <span>Medium</span>
                  <span>Hot</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Price Range Preference</h3>
              <RadioGroup
                value={preferences.priceRange}
                onValueChange={(value: PriceRange) => setPreferences(prev => ({ ...prev, priceRange: value }))}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {["budget", "moderate", "upscale", "luxury"].map((range) => (
                  <div key={range} className="flex items-center space-x-3 bg-accent/20 p-3 rounded-lg">
                    <RadioGroupItem value={range} id={range} />
                    <Label htmlFor={range} className="capitalize cursor-pointer">
                      {range}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
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