import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Hero = () => {
  const [restaurantUrl, setRestaurantUrl] = useState("");

  const handleImport = () => {
    console.log("Importing restaurant:", restaurantUrl);
    // Implementation for importing would go here
  };

  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-accent/30 to-background">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6 animate-fade-up">
          Import restaurants
          <span className="block text-primary">from Google</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-up">
          Easily save and organize your favorite restaurants by importing them directly from Google Maps links.
        </p>
        <div className="max-w-xl mx-auto flex flex-col md:flex-row gap-4 animate-fade-up">
          <Input
            type="text"
            placeholder="Paste restaurant URL..."
            value={restaurantUrl}
            onChange={(e) => setRestaurantUrl(e.target.value)}
            className="flex-grow text-lg p-6"
          />
          <Button 
            onClick={handleImport}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
          >
            Import Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;