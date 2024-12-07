import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin } from "lucide-react";

const Hero = () => {
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleImport = async () => {
    if (!restaurantUrl) {
      toast.error("Please enter a restaurant URL");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      console.log("Fetching restaurant data for URL:", restaurantUrl);
      
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { url: restaurantUrl }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      console.log("Received response:", data);
      
      if (!data?.result?.result?.place_id) {
        console.error("No place_id found in response:", data);
        throw new Error("No restaurant data found");
      }

      const placeId = data.result.result.place_id;
      console.log("Navigating to restaurant page with ID:", placeId);
      navigate(`/restaurant/${placeId}`);
      
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to find restaurant. Please make sure you're using a valid Google Maps link.");
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
          
          <div className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2 animate-fade-up"
               style={{ animationDelay: "600ms" }}>
            <MapPin className="h-4 w-4 text-primary animate-bounce" />
            <span>Pro tip: Just click "Share" in Google Maps and paste the link here! ✨</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;