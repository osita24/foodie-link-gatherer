import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Hero = () => {
  const [restaurantUrl, setRestaurantUrl] = useState("");

  const handleImport = () => {
    console.log("Importing restaurant:", restaurantUrl);
  };

  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-accent/30 to-background overflow-hidden">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6 animate-fade-up">
          Welcome to
          <span className="block text-primary animate-fade-up" style={{ animationDelay: "200ms" }}>
            FindDine
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "400ms" }}>
          Discover restaurants that perfectly match your taste. Import from Google Maps and get personalized menu recommendations.
        </p>
        <div className="max-w-xl mx-auto flex flex-col md:flex-row gap-4 animate-fade-up" style={{ animationDelay: "600ms" }}>
          <Input
            type="text"
            placeholder="Paste restaurant URL..."
            value={restaurantUrl}
            onChange={(e) => setRestaurantUrl(e.target.value)}
            className="flex-grow text-lg p-6 transform transition-transform duration-300 hover:scale-[1.02] focus:scale-[1.02]"
          />
          <Button 
            onClick={handleImport}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Find Match
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;