import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  isLastStep?: boolean;
  canProgress?: boolean;
}

const OnboardingLayout = ({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isLastStep = false,
  canProgress = true,
}: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-accent to-white">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            {children}
            
            <div className="flex justify-between pt-6">
              <Button
                variant="ghost"
                onClick={onBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Back
              </Button>
              
              <Button
                onClick={onNext}
                disabled={!canProgress}
                className="flex items-center gap-2"
              >
                {isLastStep ? "Complete" : "Next"}
                {!isLastStep && <ChevronRight size={16} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;