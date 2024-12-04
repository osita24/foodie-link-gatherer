import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { extractPlaceId } from "@/utils/googleMapsUrl";

const Hero = () => {
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const navigate = useNavigate();

  const handleImport = () => {
    if (!restaurantUrl) {
      toast.error("Please enter a restaurant URL");
      return;
    }
    
    console.log("Importing restaurant:", restaurantUrl);
    const placeId = extractPlaceId(restaurantUrl);
    
    if (!placeId) {
      toast.error("Please use a direct Google Maps link. Shortened URLs (g.co) are not supported yet.");
      return;
    }

    setRestaurantUrl("");
    toast.success("Processing your restaurant...");
    navigate(`/restaurant/${placeId}`);
  };

  return (
    <section className="relative min-h-[70vh] bg-background">
      <div className="container px-4 mx-auto min-h-[70vh] flex items-center justify-center">
        <div className="max-w-3xl w-full text-center space-y-8 p-8 rounded-2xl">
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
            />
            <Button 
              onClick={handleImport}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold
                transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg
                focus:ring-4 focus:ring-primary/20 active:scale-95"
            >
              Find Match
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4 animate-fade-up" style={{ animationDelay: "600ms" }}>
            Example: https://maps.google.com/...
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;