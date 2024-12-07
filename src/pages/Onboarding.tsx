import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import WelcomeStep from "@/components/onboarding/steps/WelcomeStep";
import DietaryStep from "@/components/onboarding/steps/DietaryStep";
import CuisineStep from "@/components/onboarding/steps/CuisineStep";
import AvoidanceStep from "@/components/onboarding/steps/AvoidanceStep";
import AtmosphereStep from "@/components/onboarding/steps/AtmosphereStep";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [preferences, setPreferences] = useState({
    cuisinePreferences: [] as string[],
    dietaryRestrictions: [] as string[],
    foodsToAvoid: [] as string[],
    atmospherePreferences: [] as string[],
  });

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
    if (step === 5) {
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
            favorite_ingredients: preferences.foodsToAvoid,
            atmosphere_preferences: preferences.atmospherePreferences,
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <WelcomeStep
            name={name}
            onChange={setName}
          />
        );
      
      case 2:
        return (
          <DietaryStep
            selected={preferences.dietaryRestrictions}
            onChange={(restrictions) => setPreferences(prev => ({
              ...prev,
              dietaryRestrictions: restrictions
            }))}
          />
        );
      
      case 3:
        return (
          <CuisineStep
            selected={preferences.cuisinePreferences}
            onChange={(cuisines) => setPreferences(prev => ({
              ...prev,
              cuisinePreferences: cuisines
            }))}
          />
        );

      case 4:
        return (
          <AvoidanceStep
            selected={preferences.foodsToAvoid}
            onChange={(items) => setPreferences(prev => ({
              ...prev,
              foodsToAvoid: items
            }))}
          />
        );

      case 5:
        return (
          <AtmosphereStep
            selected={preferences.atmospherePreferences}
            onChange={(atmospheres) => setPreferences(prev => ({
              ...prev,
              atmospherePreferences: atmospheres
            }))}
          />
        );
    }
  };

  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={5}
      onNext={handleNext}
      onBack={handleBack}
      isLastStep={step === 5}
      canProgress={step === 1 ? name.trim().length > 0 : true}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

export default Onboarding;