import { Beef, Fish, Egg, Drumstick, Ban } from "lucide-react";
import PreferenceCard from "@/components/profile/preferences/PreferenceCard";

interface ProteinStepProps {
  selected: string[];
  onChange: (proteins: string[]) => void;
}

const ProteinStep = ({ selected, onChange }: ProteinStepProps) => {
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

  const handleProteinToggle = (protein: string) => {
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
    console.log("Updated protein preferences:", newProteins); // Log for debugging
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Protein Preferences 🥩</h2>
        <p className="text-muted-foreground">
          Select your preferred protein sources to help us find the best dishes for you
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {proteinTypes.map((protein) => (
          <PreferenceCard
            key={protein.name}
            label={protein.name}
            description={protein.description}
            icon={protein.icon}
            selected={selected.includes(protein.name)}
            onClick={() => handleProteinToggle(protein.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProteinStep;