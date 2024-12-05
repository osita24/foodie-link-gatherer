import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { fetchRestaurantDetails } from "@/services/googlePlaces";
import RestaurantPreviewCard from "./restaurant/RestaurantPreviewCard";
import { RestaurantDetails } from "@/types/restaurant";

const Hero = () => {
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchingRestaurants, setMatchingRestaurants] = useState<RestaurantDetails[]>([]);

  const handleImport = async () => {
    if (!restaurantUrl) {
      toast.error("Please enter a restaurant URL");
      return;
    }
    
    setIsProcessing(true);
    console.log("Starting import process for URL:", restaurantUrl);
    
    try {
      const restaurantDetails = await fetchRestaurantDetails(restaurantUrl);
      console.log("Received restaurant details:", restaurantDetails);
      
      if (!restaurantDetails?.id) {
        throw new Error("Could not find restaurant details");
      }
      
      // For now, we'll just show the single restaurant as a match
      // In a real implementation, you'd fetch similar restaurants based on preferences
      setMatchingRestaurants([restaurantDetails]);
      setRestaurantUrl("");
      toast.success("Found matching restaurants!");
    } catch (error) {
      console.error("Error processing URL:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while processing the URL");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="relative min-h-[70vh] bg-background">
      <div className="container px-4 mx-auto min-h-[70vh]">
        <div className="max-w-3xl w-full mx-auto text-center space-y-8 p-8 rounded-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-secondary animate-fade-up">
            Find Your Perfect Dining Match with FindDine
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-up" 
             style={{ animationDelay: "200ms" }}>
            Discover restaurants that perfectly match your taste. Import from Google Maps and get personalized menu recommendations.
          </p>
          <div 
            className="max-w-xl mx-auto flex flex-col md:flex-row gap-4 animate-fade-up" 
            style={{ animationDelay: "400ms" }}
          >
            <Input
              type="url"
              placeholder="Paste Google Maps restaurant URL..."
              value={restaurantUrl}
              onChange={(e) => setRestaurantUrl(e.target.value)}
              className="flex-grow text-lg p-6 bg-white border-2 border-gray-200 
                focus:border-primary focus:ring-2 focus:ring-primary/20
                rounded-lg transition-all duration-300"
              disabled={isProcessing}
            />
            <Button 
              onClick={handleImport}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold
                transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg
                focus:ring-4 focus:ring-primary/20 active:scale-95"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Find Match"}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4 animate-fade-up" style={{ animationDelay: "600ms" }}>
            Works with all Google Maps URLs including shortened links (goo.gl/maps) and share links
          </p>
        </div>

        {matchingRestaurants.length > 0 && (
          <div className="mt-16 animate-fade-up">
            <h2 className="text-2xl font-semibold mb-8 text-center">Restaurants That Match Your Taste</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingRestaurants.map((restaurant) => (
                <RestaurantPreviewCard
                  key={restaurant.id}
                  id={restaurant.id}
                  name={restaurant.name}
                  rating={restaurant.rating}
                  address={restaurant.address}
                  imageUrl={restaurant.photos?.[0]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;