import { Beef, Fish, Egg, Drumstick, Ban } from "lucide-react";
import PreferenceCard from "./PreferenceCard";

interface ProteinPreferencesProps {
  selected: string[];
  onChange: (proteins: string[]) => void;
}

const ProteinPreferences = ({ selected, onChange }: ProteinPreferencesProps) => {
  const proteinTypes = [
    { name: "Doesn't Apply", icon: <Ban />, description: "For vegetarians/vegans" },
    { name: "Beef", icon: <Beef /> },
    { name: "Chicken", icon: <Drumstick /> },
    { name: "Fish", icon: <Fish /> },
    { name: "Pork", icon: <Beef /> },
    { name: "Eggs", icon: <Egg /> },
    { name: "Tofu", icon: <Beef /> },
    { name: "Lamb", icon: <Beef /> },
    { name: "Turkey", icon: <Drumstick /> }
  ];

  const toggleProtein = (protein: string) => {
    if (protein === "Doesn't Apply") {
      // If selecting "Doesn't Apply", clear all other selections
      onChange(["Doesn't Apply"]);
      return;
    }

    // If selecting a specific protein, remove "Doesn't Apply" if it's selected
    const newProteins = selected.includes(protein)
      ? selected.filter(p => p !== protein)
      : [...selected.filter(p => p !== "Doesn't Apply"), protein];
    
    onChange(newProteins);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {proteinTypes.map((protein) => (
        <PreferenceCard
          key={protein.name}
          label={protein.name}
          description={protein.description}
          selected={selected.includes(protein.name)}
          onClick={() => toggleProtein(protein.name)}
          icon={protein.icon}
        />
      ))}
    </div>
  );
};

export default ProteinPreferences;