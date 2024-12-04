import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const RestaurantPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    cuisinePreferences: [],
    dietaryRestrictions: [],
    favoriteIngredients: [],
    spiceLevel: 3,
    priceRange: "moderate",
    atmospherePreferences: [],
    specialConsiderations: "",
  });

  const cuisineTypes = [
    "Italian", "Japanese", "Mexican", "Indian", 
    "Chinese", "Thai", "American", "Mediterranean",
    "French", "Korean", "Vietnamese", "Spanish",
    "Greek", "Middle Eastern", "Brazilian", "Caribbean"
  ];

  const dietaryPreferences = [
    "Vegetarian", "Vegan", "Gluten-Free", 
    "Halal", "Kosher", "Dairy-Free",
    "Nut-Free", "Low-Carb", "Keto-Friendly"
  ];

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
            priceRange: data.price_range || "moderate",
            atmospherePreferences: data.atmosphere_preferences || [],
            specialConsiderations: data.special_considerations || "",
          });
        }
      }
    };

    loadPreferences();
  }, []);

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
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cuisine Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cuisineTypes.map((cuisine) => (
            <div key={cuisine} className="flex items-center space-x-3 bg-accent/20 p-3 rounded-lg hover:bg-accent/30 transition-colors">
              <Checkbox 
                id={cuisine}
                checked={preferences.cuisinePreferences.includes(cuisine)}
                onCheckedChange={() => setPreferences(prev => ({
                  ...prev,
                  cuisinePreferences: toggleArrayPreference(prev.cuisinePreferences, cuisine)
                }))}
              />
              <Label htmlFor={cuisine} className="cursor-pointer">{cuisine}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dietary Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dietaryPreferences.map((pref) => (
            <div key={pref} className="flex items-center space-x-3 bg-accent/20 p-3 rounded-lg hover:bg-accent/30 transition-colors">
              <Checkbox 
                id={pref}
                checked={preferences.dietaryRestrictions.includes(pref)}
                onCheckedChange={() => setPreferences(prev => ({
                  ...prev,
                  dietaryRestrictions: toggleArrayPreference(prev.dietaryRestrictions, pref)
                }))}
              />
              <Label htmlFor={pref} className="cursor-pointer">{pref}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Atmosphere Preferences</h3>
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
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Favorite Ingredients</h3>
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
      </div>

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
          onValueChange={(value) => setPreferences(prev => ({ ...prev, priceRange: value }))}
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

      <Button onClick={handleSave} className="w-full md:w-auto">
        Save Preferences
      </Button>
    </div>
  );
};

export default RestaurantPreferences;