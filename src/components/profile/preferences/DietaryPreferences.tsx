import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DietaryPreferencesProps {
  selected: string[];
  onChange: (restrictions: string[]) => void;
}

const DietaryPreferences = ({ selected, onChange }: DietaryPreferencesProps) => {
  const dietaryPreferences = [
    "Vegetarian", "Vegan", "Gluten-Free", 
    "Halal", "Kosher", "Dairy-Free",
    "Nut-Free", "Low-Carb", "Keto-Friendly"
  ];

  const toggleDietary = (diet: string) => {
    const newDietary = selected.includes(diet)
      ? selected.filter(d => d !== diet)
      : [...selected, diet];
    onChange(newDietary);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Dietary Preferences</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {dietaryPreferences.map((pref) => (
          <div key={pref} className="flex items-center space-x-3 bg-accent/20 p-3 rounded-lg hover:bg-accent/30 transition-colors">
            <Checkbox 
              id={pref}
              checked={selected.includes(pref)}
              onCheckedChange={() => toggleDietary(pref)}
            />
            <Label htmlFor={pref} className="cursor-pointer">{pref}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DietaryPreferences;