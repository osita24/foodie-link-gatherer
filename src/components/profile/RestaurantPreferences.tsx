import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const RestaurantPreferences = () => {
  const cuisineTypes = [
    "Italian", "Japanese", "Mexican", "Indian", 
    "Chinese", "Thai", "American", "Mediterranean"
  ];

  const dietaryPreferences = [
    "Vegetarian", "Vegan", "Gluten-Free", 
    "Halal", "Kosher", "Dairy-Free"
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cuisine Preferences</h3>
        <div className="grid grid-cols-2 gap-4">
          {cuisineTypes.map((cuisine) => (
            <div key={cuisine} className="flex items-center space-x-2">
              <Checkbox id={cuisine} />
              <Label htmlFor={cuisine}>{cuisine}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dietary Preferences</h3>
        <div className="grid grid-cols-2 gap-4">
          {dietaryPreferences.map((pref) => (
            <div key={pref} className="flex items-center space-x-2">
              <Checkbox id={pref} />
              <Label htmlFor={pref}>{pref}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button>Save Preferences</Button>
    </div>
  );
};

export default RestaurantPreferences;