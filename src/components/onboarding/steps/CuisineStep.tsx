import { motion } from "framer-motion";
import PreferenceCard from "@/components/profile/preferences/PreferenceCard";
import { Utensils, Pizza, Soup, Coffee, Fish, Beef, Salad } from "lucide-react";

interface CuisineStepProps {
  selected: string[];
  onChange: (cuisines: string[]) => void;
}

const CuisineStep = ({ selected, onChange }: CuisineStepProps) => {
  const cuisineTypes = [
    { name: "Italian", icon: <Pizza className="w-5 h-5" /> },
    { name: "Japanese", icon: <Soup className="w-5 h-5" /> },
    { name: "Mexican", icon: <Utensils className="w-5 h-5" /> },
    { name: "Indian", icon: <Coffee className="w-5 h-5" /> },
    { name: "Chinese", icon: <Soup className="w-5 h-5" /> },
    { name: "Thai", icon: <Fish className="w-5 h-5" /> },
    { name: "American", icon: <Beef className="w-5 h-5" /> },
    { name: "Mediterranean", icon: <Salad className="w-5 h-5" /> },
    { name: "French", icon: <Coffee className="w-5 h-5" /> },
    { name: "Korean", icon: <Soup className="w-5 h-5" /> },
    { name: "Vietnamese", icon: <Soup className="w-5 h-5" /> },
    { name: "Middle Eastern", icon: <Utensils className="w-5 h-5" /> }
  ];

  const toggleCuisine = (cuisine: string) => {
    const newSelected = selected.includes(cuisine)
      ? selected.filter(c => c !== cuisine)
      : [...selected, cuisine];
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
          What's Your Food Mood? 🌎
        </h1>
        <p className="text-gray-500">Pick your favorite cuisines</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cuisineTypes.map((cuisine) => (
          <PreferenceCard
            key={cuisine.name}
            label={cuisine.name}
            selected={selected.includes(cuisine.name)}
            onClick={() => toggleCuisine(cuisine.name)}
            icon={cuisine.icon}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default CuisineStep;