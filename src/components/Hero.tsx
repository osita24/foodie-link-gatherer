import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./auth/AuthProvider";

const Hero = () => {
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // Assume we have a function to handle the restaurant URL submission
      await submitRestaurantUrl(restaurantUrl);
      toast({
        title: "Success",
        description: "Restaurant URL submitted successfully!",
      });
      setRestaurantUrl("");
    } catch (error) {
      console.error("Error submitting restaurant URL:", error);
      toast({
        title: "Error",
        description: "There was an error submitting the URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-background pt-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-secondary font-serif animate-fade-up">
          {session ? (
            <>
              {getGreeting()}, {session.user.user_metadata.full_name || session.user.email?.split('@')[0]}! 👋
            </>
          ) : (
            "Welcome to Cilantro! Please sign in to get started."
          )}
        </h1>
        <form onSubmit={handleSubmit} className="mt-6">
          <Input
            type="text"
            placeholder="Enter restaurant URL"
            value={restaurantUrl}
            onChange={(e) => setRestaurantUrl(e.target.value)}
            required
          />
          <Button type="submit" className="mt-4" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Submit"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Hero;
