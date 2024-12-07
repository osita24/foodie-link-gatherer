import { Utensils, Pizza, Soup, Coffee, Fish, Beef, Salad, Sandwich } from "lucide-react";
import PreferenceCard from "./PreferenceCard";

interface CuisinePreferencesProps {
  selected: string[];
  onChange: (cuisines: string[]) => void;
}

const CuisinePreferences = ({ selected, onChange }: CuisinePreferencesProps) => {
  const cuisineTypes = [
    { name: "Italian", icon: <Pizza /> },
    { name: "Japanese", icon: <Soup /> },
    { name: "Mexican", icon: <Utensils /> },
    { name: "Indian", icon: <Coffee /> },
    { name: "Chinese", icon: <Soup /> },
    { name: "Thai", icon: <Fish /> },
    { name: "American", icon: <Beef /> },
    { name: "Mediterranean", icon: <Salad /> },
    { name: "French", icon: <Coffee /> },
    { name: "Korean", icon: <Soup /> },
    { name: "Vietnamese", icon: <Soup /> },
    { name: "Spanish", icon: <Sandwich /> },
    { name: "Greek", icon: <Salad /> },
    { name: "Middle Eastern", icon: <Utensils /> },
    { name: "Brazilian", icon: <Beef /> },
    { name: "Caribbean", icon: <Fish /> }
  ];

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = selected.includes(cuisine)
      ? selected.filter(c => c !== cuisine)
      : [...selected, cuisine];
    onChange(newCuisines);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
  );
};

export default CuisinePreferences;