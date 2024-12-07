import { UtensilsCrossed, Wind, Cherry, Settings2 } from "lucide-react";
import PreferenceCard from "./PreferenceCard";

interface AtmospherePreferencesProps {
  selected: string[];
  onChange: (atmospheres: string[]) => void;
}

const AtmospherePreferences = ({ selected, onChange }: AtmospherePreferencesProps) => {
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
  );
};

export default AtmospherePreferences;