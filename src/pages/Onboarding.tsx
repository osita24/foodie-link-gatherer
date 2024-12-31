import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import WelcomeStep from "@/components/onboarding/steps/WelcomeStep";
import DietaryStep from "@/components/onboarding/steps/DietaryStep";
import CuisineStep from "@/components/onboarding/steps/CuisineStep";
import AvoidanceStep from "@/components/onboarding/steps/AvoidanceStep";
import AtmosphereStep from "@/components/onboarding/steps/AtmosphereStep";
import ProteinStep from "@/components/onboarding/steps/ProteinStep";

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [preferences, setPreferences] = useState({
    cuisinePreferences: [] as string[],
    dietaryRestrictions: [] as string[],
    foodsToAvoid: [] as string[],
    atmospherePreferences: [] as string[],
    favoriteProteins: [] as string[],
  });

  // Get the return URL from state or default to home
  const returnUrl = location.state?.returnUrl || "/";
  console.log("🔄 Return URL after onboarding:", returnUrl);

  const canProgress = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return preferences.dietaryRestrictions.length > 0;
      case 3:
        return preferences.cuisinePreferences.length > 0;
      case 4:
        return preferences.foodsToAvoid.length > 0;
      case 5:
        return preferences.favoriteProteins.length > 0;
      case 6:
        return preferences.atmospherePreferences.length > 0;
      default:
        return false;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("⚠️ No session found, redirecting to home");
        navigate("/");
      }
    };

    checkSession();
  }, [navigate]);

  const handleNext = async () => {
    if (step === 6) {
      try {
        console.log("🔄 Saving preferences...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("❌ No user found");
          return;
        }

        await supabase.auth.updateUser({
          data: { full_name: name }
        });

        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            cuisine_preferences: preferences.cuisinePreferences,
            dietary_restrictions: preferences.dietaryRestrictions,
            favorite_ingredients: preferences.foodsToAvoid,
            atmosphere_preferences: preferences.atmospherePreferences,
            favorite_proteins: preferences.favoriteProteins,
          });

        if (preferencesError) throw preferencesError;

        console.log("✅ Preferences saved successfully");
        toast({
          title: "Welcome aboard! 🎉",
          description: "Your preferences have been saved. Let's find you some great restaurants!",
        });

        console.log("🔄 Navigating to:", returnUrl);
        navigate(returnUrl);
      } catch (error) {
        console.error('❌ Error saving preferences:', error);
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
          <ProteinStep
            selected={preferences.favoriteProteins}
            onChange={(proteins) => setPreferences(prev => ({
              ...prev,
              favoriteProteins: proteins
            }))}
          />
        );

      case 6:
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
      totalSteps={6}
      onNext={handleNext}
      onBack={handleBack}
      isLastStep={step === 6}
      canProgress={canProgress()}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

export default Onboarding;