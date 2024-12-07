import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface WelcomeStepProps {
  name: string;
  onChange: (name: string) => void;
}

const WelcomeStep = ({ name, onChange }: WelcomeStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          Welcome to Your Food Journey! 🎉
        </h1>
        <p className="text-gray-500">Let's start by getting to know you</p>
      </div>
      
      <div className="space-y-4 max-w-md mx-auto">
        <Label htmlFor="name" className="text-lg">What should we call you?</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your name"
          className="text-lg h-12"
        />
        <p className="text-sm text-gray-500 text-center animate-pulse">
          We'll use this to personalize your experience
        </p>
      </div>
    </motion.div>
  );
};

export default WelcomeStep;