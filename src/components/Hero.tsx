import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const navigate = useNavigate();

  const handleImport = () => {
    if (!restaurantUrl) {
      toast.error("Please enter a restaurant URL");
      return;
    }
    
    console.log("Importing restaurant:", restaurantUrl);
    // Clear the input after submission
    setRestaurantUrl("");
    toast.success("Processing your restaurant...");
    
    // Navigate to the restaurant details page
    // In a real app, you'd first process the URL and get the restaurant ID
    navigate('/restaurant/sample-id');
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="container px-4 mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 animate-fade-up">
          Find Your Perfect Dining Match with FindDine
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "400ms" }}>
          Discover restaurants that perfectly match your taste. Import from Google Maps and get personalized menu recommendations.
        </p>
        <div 
          className="max-w-xl mx-auto flex flex-col md:flex-row gap-4 animate-fade-up bg-white p-4 rounded-lg shadow-lg" 
          style={{ animationDelay: "600ms" }}
        >
          <Input
            type="url"
            placeholder="Paste Google Maps restaurant URL..."
            value={restaurantUrl}
            onChange={(e) => setRestaurantUrl(e.target.value)}
            className="flex-grow text-lg p-6 border-2 border-primary/20 bg-white text-secondary placeholder:text-gray-400 
              transform transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20
              rounded-lg shadow-sm"
          />
          <Button 
            onClick={handleImport}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold
              transform transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg
              focus:ring-4 focus:ring-primary/20 active:scale-95"
          >
            Find Match
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-4 animate-fade-up" style={{ animationDelay: "800ms" }}>
          Example: https://maps.google.com/...
        </p>
      </div>
    </section>
  );
};

export default Hero;