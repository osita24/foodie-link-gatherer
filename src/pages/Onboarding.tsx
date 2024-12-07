import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CuisinePreferences from "@/components/profile/preferences/CuisinePreferences";
import DietaryPreferences from "@/components/profile/preferences/DietaryPreferences";
import SpiceLevelSelector from "@/components/profile/preferences/SpiceLevelSelector";
import PriceRangeSelector from "@/components/profile/preferences/PriceRangeSelector";
import { UserPreferences } from "@/types/preferences";
import PreferenceCard from "@/components/profile/preferences/PreferenceCard";
import { UtensilsCrossed, Wind, Cherry, Settings2 } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    cuisinePreferences: [],
    dietaryRestrictions: [],
    favoriteIngredients: [],
    spiceLevel: 3,
    priceRange: 'moderate',
    atmospherePreferences: [],
    specialConsiderations: "",
  });

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
    { name: "Tofu", icon: <UtensilsCrossed /> },
    { name: "Mushrooms", icon: <UtensilsCrossed /> },
    { name: "Avocado", icon: <Cherry /> },
    { name: "Rice", icon: <Cherry /> },
    { name: "Noodles", icon: <UtensilsCrossed /> }
  ];

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      }
    };

    checkSession();
  }, [navigate]);

  const handleNext = async () => {
    if (step === 6) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Update user metadata with name
        await supabase.auth.updateUser({
          data: { full_name: name }
        });

        // Save preferences
        const { error: preferencesError } = await supabase
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

        if (preferencesError) throw preferencesError;

        toast({
          title: "Welcome aboard! 🎉",
          description: "Your preferences have been saved. Let's find you some great restaurants!",
        });

        navigate("/");
      } catch (error) {
        console.error('Error saving preferences:', error);
        toast({
          title: "Error",
          description: "Failed to save your preferences. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const toggleArrayPreference = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">Welcome! 👋</h1>
              <p className="text-gray-500">Let's start with your name</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">What should we call you?</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="text-lg"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">Food Preferences 🍜</h1>
              <p className="text-gray-500">Select your favorite cuisines</p>
            </div>
            
            <CuisinePreferences
              selected={preferences.cuisinePreferences || []}
              onChange={(cuisines) => setPreferences(prev => ({ ...prev, cuisinePreferences: cuisines }))}
            />
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">Dietary Preferences 🥗</h1>
              <p className="text-gray-500">Any dietary restrictions?</p>
            </div>
            
            <DietaryPreferences
              selected={preferences.dietaryRestrictions || []}
              onChange={(restrictions) => setPreferences(prev => ({ ...prev, dietaryRestrictions: restrictions }))}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">Favorite Ingredients 🥩</h1>
              <p className="text-gray-500">Select ingredients you love</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favoriteIngredients.map((ingredient) => (
                <PreferenceCard
                  key={ingredient.name}
                  label={ingredient.name}
                  selected={preferences.favoriteIngredients?.includes(ingredient.name) || false}
                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    favoriteIngredients: toggleArrayPreference(prev.favoriteIngredients || [], ingredient.name)
                  }))}
                  icon={ingredient.icon}
                />
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">Dining Preferences 🍽️</h1>
              <p className="text-gray-500">What's your preferred dining style?</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {atmosphereTypes.map((atmosphere) => (
                <PreferenceCard
                  key={atmosphere.name}
                  label={atmosphere.name}
                  selected={preferences.atmospherePreferences?.includes(atmosphere.name) || false}
                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    atmospherePreferences: toggleArrayPreference(prev.atmospherePreferences || [], atmosphere.name)
                  }))}
                  icon={atmosphere.icon}
                />
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">Final Preferences 🌶️</h1>
              <p className="text-gray-500">Just a few more details to help us find the perfect spots for you</p>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Spice Level Preference</h3>
                <SpiceLevelSelector
                  value={preferences.spiceLevel || 3}
                  onChange={(value) => setPreferences(prev => ({ ...prev, spiceLevel: value }))}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Price Range Preference</h3>
                <PriceRangeSelector
                  value={preferences.priceRange || 'moderate'}
                  onChange={(value) => setPreferences(prev => ({ ...prev, priceRange: value }))}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={6}
      onNext={handleNext}
      onBack={handleBack}
      isLastStep={step === 6}
      canProgress={step === 1 ? name.trim().length > 0 : true}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

export default Onboarding;