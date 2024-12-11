import { motion } from "framer-motion";
import PreferenceCard from "@/components/profile/preferences/PreferenceCard";
import { Shell, Nut, Egg, Leaf, Ban, Fish, Flame, Check, Cookie, Droplets } from "lucide-react";

interface AvoidanceStepProps {
  selected: string[];
  onChange: (items: string[]) => void;
}

const AvoidanceStep = ({ selected, onChange }: AvoidanceStepProps) => {
  const avoidanceItems = [
    { name: "No Restrictions", icon: <Check className="w-5 h-5" /> },
    { name: "Shellfish", icon: <Shell className="w-5 h-5" /> },
    { name: "Peanuts", icon: <Nut className="w-5 h-5" /> },
    { name: "Tree Nuts", icon: <Nut className="w-5 h-5" /> },
    { name: "Eggs", icon: <Egg className="w-5 h-5" /> },
    { name: "Soy", icon: <Leaf className="w-5 h-5" /> },
    { name: "Mushrooms", icon: <Ban className="w-5 h-5" /> },
    { name: "Bell Peppers", icon: <Leaf className="w-5 h-5" /> },
    { name: "Raw Fish", icon: <Fish className="w-5 h-5" /> },
    { name: "Very Spicy", icon: <Flame className="w-5 h-5" /> },
    { name: "Sweet Foods", icon: <Cookie className="w-5 h-5" /> },
    { name: "Oily Foods", icon: <Droplets className="w-5 h-5" /> },
    { name: "Salty Foods", icon: <Droplets className="w-5 h-5" /> }
  ];

  const toggleItem = (item: string) => {
    if (item === "No Restrictions") {
      onChange(["No Restrictions"]);
      return;
    }

    const newSelected = selected.includes(item)
      ? selected.filter(i => i !== item)
      : [...selected.filter(s => s !== "No Restrictions"), item];
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
          Foods to Skip? 🚫
        </h1>
        <p className="text-gray-500">Help us avoid recommending foods you don't enjoy</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {avoidanceItems.map((item) => (
          <PreferenceCard
            key={item.name}
            label={item.name}
            selected={selected.includes(item.name)}
            onClick={() => toggleItem(item.name)}
            icon={item.icon}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default AvoidanceStep;