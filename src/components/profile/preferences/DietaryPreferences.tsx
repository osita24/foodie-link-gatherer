import { Leaf, Apple, Wheat, Ban, Scale, Milk, Check } from "lucide-react";
import PreferenceCard from "./PreferenceCard";

interface DietaryPreferencesProps {
  selected: string[];
  onChange: (restrictions: string[]) => void;
}

const DietaryPreferences = ({ selected, onChange }: DietaryPreferencesProps) => {
  const dietaryPreferences = [
    { name: "No Restrictions", icon: <Check /> },
    { name: "Vegetarian", icon: <Leaf /> },
    { name: "Vegan", icon: <Apple /> },
    { name: "Gluten-Free", icon: <Wheat /> },
    { name: "Halal", icon: <Ban /> },
    { name: "Kosher", icon: <Ban /> },
    { name: "Dairy-Free", icon: <Milk /> },
    { name: "Nut-Free", icon: <Ban /> },
    { name: "Low-Carb", icon: <Scale /> },
    { name: "Keto-Friendly", icon: <Scale /> }
  ];

  const toggleDietary = (diet: string) => {
    if (diet === "No Restrictions") {
      onChange(["No Restrictions"]);
      return;
    }

    const newDietary = selected.includes(diet)
      ? selected.filter(d => d !== diet)
      : [...selected.filter(s => s !== "No Restrictions"), diet];
    onChange(newDietary);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {dietaryPreferences.map((pref) => (
        <PreferenceCard
          key={pref.name}
          label={pref.name}
          selected={selected.includes(pref.name)}
          onClick={() => toggleDietary(pref.name)}
          icon={pref.icon}
        />
      ))}
    </div>
  );
};

export default DietaryPreferences;