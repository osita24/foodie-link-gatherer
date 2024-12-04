import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const RestaurantPreferences = () => {
  const { toast } = useToast();
  
  const cuisineTypes = [
    "Italian", "Japanese", "Mexican", "Indian", 
    "Chinese", "Thai", "American", "Mediterranean"
  ];

  const dietaryPreferences = [
    "Vegetarian", "Vegan", "Gluten-Free", 
    "Halal", "Kosher", "Dairy-Free"
  ];

  const favoriteIngredients = [
    "Chicken", "Beef", "Fish", "Tofu",
    "Mushrooms", "Avocado", "Cheese", "Rice",
    "Noodles", "Eggs"
  ];

  const handleSave = () => {
    toast({
      title: "Preferences saved",
      description: "Your restaurant preferences have been updated.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cuisine Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {cuisineTypes.map((cuisine) => (
            <div key={cuisine} className="flex items-center space-x-3 bg-accent/20 p-3 rounded-lg hover:bg-accent/30 transition-colors">
              <Checkbox id={cuisine} />
              <Label htmlFor={cuisine} className="cursor-pointer">{cuisine}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dietary Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {dietaryPreferences.map((pref) => (
            <div key={pref} className="flex items-center space-x-3 bg-accent/20 p-3 rounded-lg hover:bg-accent/30 transition-colors">
              <Checkbox id={pref} />
              <Label htmlFor={pref} className="cursor-pointer">{pref}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Favorite Ingredients</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {favoriteIngredients.map((ingredient) => (
            <div key={ingredient} className="flex items-center space-x-3 bg-accent/20 p-3 rounded-lg hover:bg-accent/30 transition-colors">
              <Checkbox id={ingredient} />
              <Label htmlFor={ingredient} className="cursor-pointer">{ingredient}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} className="w-full md:w-auto">
        Save Preferences
      </Button>
    </div>
  );
};

export default RestaurantPreferences;