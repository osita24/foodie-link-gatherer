import { Beef, Fish, Egg, Drumstick } from "lucide-react";
import PreferenceCard from "./PreferenceCard";

interface ProteinPreferencesProps {
  selected: string[];
  onChange: (proteins: string[]) => void;
}

const ProteinPreferences = ({ selected, onChange }: ProteinPreferencesProps) => {
  const proteinTypes = [
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
    const newProteins = selected.includes(protein)
      ? selected.filter(p => p !== protein)
      : [...selected, protein];
    onChange(newProteins);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {proteinTypes.map((protein) => (
        <PreferenceCard
          key={protein.name}
          label={protein.name}
          selected={selected.includes(protein.name)}
          onClick={() => toggleProtein(protein.name)}
          icon={protein.icon}
        />
      ))}
    </div>
  );
};

export default ProteinPreferences;