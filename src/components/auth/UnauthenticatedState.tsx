import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface UnauthenticatedStateProps {
  title: string;
  description: string;
  onAuthClick: () => void;
}

const UnauthenticatedState = ({ title, description, onAuthClick }: UnauthenticatedStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-up">
      <div className="text-center max-w-md space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        
        <p className="text-gray-600 text-lg leading-relaxed">
          {description}
        </p>
        
        <div className="space-y-4 pt-4">
          <Button 
            onClick={onAuthClick}
            className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold
              transition-all duration-300 hover:scale-105"
          >
            Sign in to Continue
          </Button>
          
          <p className="text-sm text-gray-500">
            Join thousands of food lovers discovering their next favorite restaurant
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthenticatedState;