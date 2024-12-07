import { motion } from "framer-motion";
import PreferenceCard from "@/components/profile/preferences/PreferenceCard";
import { Leaf, Ban, Scale, Wheat, Apple, Milk, Check } from "lucide-react";

interface DietaryStepProps {
  selected: string[];
  onChange: (restrictions: string[]) => void;
}

const DietaryStep = ({ selected, onChange }: DietaryStepProps) => {
  const dietaryOptions = [
    { name: "No Restrictions", icon: <Check className="w-5 h-5" /> },
    { name: "Vegetarian", icon: <Leaf className="w-5 h-5" /> },
    { name: "Vegan", icon: <Apple className="w-5 h-5" /> },
    { name: "Gluten-Free", icon: <Wheat className="w-5 h-5" /> },
    { name: "Halal", icon: <Ban className="w-5 h-5" /> },
    { name: "Kosher", icon: <Ban className="w-5 h-5" /> },
    { name: "Dairy-Free", icon: <Milk className="w-5 h-5" /> },
    { name: "Nut-Free", icon: <Ban className="w-5 h-5" /> },
    { name: "Low-Carb", icon: <Scale className="w-5 h-5" /> },
    { name: "Keto-Friendly", icon: <Scale className="w-5 h-5" /> }
  ];

  const toggleOption = (option: string) => {
    if (option === "No Restrictions") {
      onChange(["No Restrictions"]);
      return;
    }

    const newSelected = selected.includes(option)
      ? selected.filter(s => s !== option)
      : [...selected.filter(s => s !== "No Restrictions"), option];
    onChange(newSelected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Any Dietary Preferences? 🥗
        </h1>
        <p className="text-gray-500">Help us find the perfect restaurants for you</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {dietaryOptions.map((option) => (
          <PreferenceCard
            key={option.name}
            label={option.name}
            selected={selected.includes(option.name)}
            onClick={() => toggleOption(option.name)}
            icon={option.icon}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default DietaryStep;