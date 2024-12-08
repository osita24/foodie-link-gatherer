import { BookMarked } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SavedRestaurantsEmpty = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-accent p-6 mb-4">
        <BookMarked className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No saved restaurants yet</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        When you find restaurants you love, save them here to keep track of your favorite spots.
      </p>
      <button 
        onClick={() => navigate('/')}
        className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Discover Restaurants
      </button>
    </div>
  );
};

export default SavedRestaurantsEmpty;