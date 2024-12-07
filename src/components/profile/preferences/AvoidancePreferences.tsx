import { Ban, Shell, Nut, Egg, Leaf, Fish, Flame, Check } from "lucide-react";
import PreferenceCard from "./PreferenceCard";

interface AvoidancePreferencesProps {
  selected: string[];
  onChange: (items: string[]) => void;
}

const AvoidancePreferences = ({ selected, onChange }: AvoidancePreferencesProps) => {
  const avoidanceItems = [
    { name: "No Restrictions", icon: <Check /> },
    { name: "Shellfish", icon: <Shell /> },
    { name: "Peanuts", icon: <Nut /> },
    { name: "Tree Nuts", icon: <Nut /> },
    { name: "Eggs", icon: <Egg /> },
    { name: "Soy", icon: <Leaf /> },
    { name: "Mushrooms", icon: <Ban /> },
    { name: "Bell Peppers", icon: <Leaf /> },
    { name: "Raw Fish", icon: <Fish /> },
    { name: "Very Spicy", icon: <Flame /> }
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
  );
};

export default AvoidancePreferences;