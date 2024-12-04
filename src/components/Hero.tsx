import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Hero = () => {
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const navigate = useNavigate();

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      alt: "Restaurant interior with warm lighting",
    },
    {
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
      alt: "Gourmet dish presentation",
    },
    {
      url: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
      alt: "Cozy dining atmosphere",
    },
  ];

  const handleImport = () => {
    if (!restaurantUrl) {
      toast.error("Please enter a restaurant URL");
      return;
    }
    
    console.log("Importing restaurant:", restaurantUrl);
    setRestaurantUrl("");
    toast.success("Processing your restaurant...");
    navigate('/restaurant/sample-id');
  };

  return (
    <section className="relative min-h-screen bg-background">
      {/* Carousel Section */}
      <div className="absolute inset-0 w-full h-full">
        <Carousel className="w-full h-full" opts={{ loop: true }}>
          <CarouselContent className="h-full">
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative w-full h-full">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>

      {/* Content Overlay */}
      <div className="relative container px-4 mx-auto min-h-screen flex items-center justify-center">
        <div className="max-w-3xl w-full text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white animate-fade-up">
            Find Your Perfect Dining Match with FindDine
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-2xl mx-auto animate-fade-up" 
             style={{ animationDelay: "400ms" }}>
            Discover restaurants that perfectly match your taste. Import from Google Maps and get personalized menu recommendations.
          </p>
          <div 
            className="max-w-xl mx-auto flex flex-col md:flex-row gap-4 animate-fade-up bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20" 
            style={{ animationDelay: "600ms" }}
          >
            <Input
              type="url"
              placeholder="Paste Google Maps restaurant URL..."
              value={restaurantUrl}
              onChange={(e) => setRestaurantUrl(e.target.value)}
              className="flex-grow text-lg p-6 border-2 border-white/20 bg-white/10 text-white placeholder:text-gray-300 
                transform transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20
                rounded-lg"
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
          <p className="text-sm text-gray-300 mt-4 animate-fade-up" style={{ animationDelay: "800ms" }}>
            Example: https://maps.google.com/...
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;