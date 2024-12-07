import { motion } from "framer-motion";
import PreferenceCard from "@/components/profile/preferences/PreferenceCard";
import { UtensilsCrossed, Wind, Cherry, Settings2 } from "lucide-react";

interface AtmosphereStepProps {
  selected: string[];
  onChange: (atmospheres: string[]) => void;
}

const AtmosphereStep = ({ selected, onChange }: AtmosphereStepProps) => {
  const atmosphereTypes = [
    { name: "Casual Dining", icon: <UtensilsCrossed className="w-5 h-5" /> },
    { name: "Fine Dining", icon: <UtensilsCrossed className="w-5 h-5" /> },
    { name: "Family-Friendly", icon: <UtensilsCrossed className="w-5 h-5" /> },
    { name: "Romantic", icon: <Cherry className="w-5 h-5" /> },
    { name: "Outdoor Seating", icon: <Wind className="w-5 h-5" /> },
    { name: "Quiet/Intimate", icon: <Wind className="w-5 h-5" /> },
    { name: "Lively/Energetic", icon: <Wind className="w-5 h-5" /> },
    { name: "Modern/Trendy", icon: <Settings2 className="w-5 h-5" /> },
    { name: "Traditional/Classic", icon: <Settings2 className="w-5 h-5" /> }
  ];

  const toggleAtmosphere = (atmosphere: string) => {
    const newSelected = selected.includes(atmosphere)
      ? selected.filter(a => a !== atmosphere)
      : [...selected, atmosphere];
    onChange(newSelected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          Perfect Vibes? 🌟
        </h1>
        <p className="text-gray-500">What's your ideal dining atmosphere?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {atmosphereTypes.map((atmosphere) => (
          <PreferenceCard
            key={atmosphere.name}
            label={atmosphere.name}
            selected={selected.includes(atmosphere.name)}
            onClick={() => toggleAtmosphere(atmosphere.name)}
            icon={atmosphere.icon}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default AtmosphereStep;