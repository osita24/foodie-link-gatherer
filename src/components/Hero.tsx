import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Sparkles, Utensils } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantUrl) return;

    setIsProcessing(true);
    console.log("🔍 Starting import for URL:", restaurantUrl);
    
    try {
      // Validate URL format
      if (!restaurantUrl.includes("google.com/maps") && !restaurantUrl.includes("goo.gl")) {
        throw new Error("Please enter a valid Google Maps URL");
      }

      console.log("📡 Calling edge function...");
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { url: restaurantUrl }
      });

      console.log("📡 Response from edge function:", data);

      if (error) {
        console.error("❌ Edge function error:", error);
        throw error;
      }

      if (!data?.result?.result?.place_id) {
        console.error("❌ No place_id in response:", data);
        throw new Error("Could not find restaurant information. Please check the URL and try again.");
      }

      const placeId = data.result.result.place_id;
      console.log("✅ Successfully found place ID:", placeId);
      
      toast.success("Restaurant found! Loading details...");
      
      // Navigate after a short delay to ensure the toast is visible
      setTimeout(() => {
        navigate(`/restaurant/${placeId}`);
      }, 500);
      
    } catch (error) {
      console.error("❌ Import error:", error);
      toast.error(error.message || "Failed to process restaurant URL. Please try again with a valid Google Maps link.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-primary/5 px-4 py-12 md:py-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute top-20 -left-12 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 -right-12 w-72 h-72 bg-accent/30 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      
      <div className="container relative z-10">
        <div className="flex flex-col items-center space-y-8 md:space-y-10 text-center max-w-2xl mx-auto">
          {/* Header section with icon */}
          <div className="space-y-6">
            <div className="relative inline-block">
              <div className="absolute -top-8 -right-8 text-primary animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="p-4 bg-primary/10 rounded-full">
                <Utensils className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent animate-fade-up">
                Find Your Next Favorite Spot
              </h1>
              <p className="text-base md:text-lg text-muted-foreground/80 animate-fade-up [animation-delay:200ms] max-w-lg mx-auto">
                Share a Google Maps link to discover your perfect dining match
              </p>
            </div>
          </div>

          {/* Search form with enhanced styling */}
          <div className="w-full max-w-xl mx-auto space-y-4 animate-fade-up [animation-delay:400ms]">
            <form onSubmit={handleImport} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-5 w-5 transition-colors group-hover:text-primary" />
                <Input
                  type="url"
                  placeholder="Paste restaurant link..."
                  value={restaurantUrl}
                  onChange={(e) => setRestaurantUrl(e.target.value)}
                  className="h-12 pl-10 text-base shadow-lg transition-all duration-300 border-2 border-accent/50 focus:border-primary/50 hover:border-primary/30 focus:ring-2 focus:ring-primary/20 rounded-xl bg-background/80 backdrop-blur-sm"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isProcessing || !restaurantUrl}
                className="h-12 px-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl whitespace-nowrap bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Find Match"
                )}
              </Button>
            </form>
            
            {/* Enhanced tip box */}
            <div className="text-sm text-muted-foreground/70 bg-accent/30 p-4 rounded-xl border border-accent/50 animate-fade-up [animation-delay:600ms] shadow-sm backdrop-blur-sm hover:bg-accent/40 transition-colors duration-300">
              <p className="flex items-center gap-2 justify-center flex-wrap">
                <span className="font-medium text-secondary">💡 Tip:</span>
                Find a restaurant on Google Maps, click Share, and paste the link!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;