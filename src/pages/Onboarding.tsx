import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CuisinePreferences from "@/components/profile/preferences/CuisinePreferences";
import DietaryPreferences from "@/components/profile/preferences/DietaryPreferences";
import { UserPreferences } from "@/types/preferences";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    cuisinePreferences: [],
    dietaryRestrictions: [],
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
    if (step === 3) {
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
          });

        if (preferencesError) throw preferencesError;

        toast({
          title: "Welcome aboard! 🎉",
          description: "Your preferences have been saved.",
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
    }
  };

  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={3}
      onNext={handleNext}
      onBack={handleBack}
      isLastStep={step === 3}
      canProgress={step === 1 ? name.trim().length > 0 : true}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

export default Onboarding;