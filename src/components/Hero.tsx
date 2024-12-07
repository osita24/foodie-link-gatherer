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
      // For now, just show a success message
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
        <p className="mt-4 text-lg text-muted-foreground">
          Share your favorite restaurant's URL and let us help you discover new dishes that match your taste.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 max-w-lg mx-auto">
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Enter restaurant URL"
              value={restaurantUrl}
              onChange={(e) => setRestaurantUrl(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Submit"}
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Tip: You can find the restaurant URL by searching for it on Google Maps and copying the link from your browser's address bar.
          </p>
        </form>
      </div>
    </section>
  );
};

export default Hero;