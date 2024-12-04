import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

const SavedRestaurants = () => {
  // Placeholder data - will be replaced with real data later
  const savedRestaurants = [
    {
      id: 1,
      name: "Italian Bistro",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      cuisine: "Italian",
      rating: 4.5,
    },
    {
      id: 2,
      name: "Sushi Place",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      cuisine: "Japanese",
      rating: 4.8,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedRestaurants.map((restaurant) => (
        <Card key={restaurant.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="relative h-48">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
              <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
            </button>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
            <p className="text-muted-foreground text-sm">{restaurant.cuisine}</p>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm">{restaurant.rating}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedRestaurants;