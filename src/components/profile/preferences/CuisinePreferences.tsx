import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CuisinePreferencesProps {
  selected: string[];
  onChange: (cuisines: string[]) => void;
}

const CuisinePreferences = ({ selected, onChange }: CuisinePreferencesProps) => {
  const cuisineTypes = [
    "Italian", "Japanese", "Mexican", "Indian", 
    "Chinese", "Thai", "American", "Mediterranean",
    "French", "Korean", "Vietnamese", "Spanish",
    "Greek", "Middle Eastern", "Brazilian", "Caribbean"
  ];

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = selected.includes(cuisine)
      ? selected.filter(c => c !== cuisine)
      : [...selected, cuisine];
    onChange(newCuisines);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Cuisine Preferences</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cuisineTypes.map((cuisine) => (
          <div key={cuisine} className="flex items-center space-x-3 bg-accent/20 p-3 rounded-lg hover:bg-accent/30 transition-colors">
            <Checkbox 
              id={cuisine}
              checked={selected.includes(cuisine)}
              onCheckedChange={() => toggleCuisine(cuisine)}
            />
            <Label htmlFor={cuisine} className="cursor-pointer">{cuisine}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CuisinePreferences;