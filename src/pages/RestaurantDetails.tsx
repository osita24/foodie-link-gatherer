import { useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { BookmarkPlus, Share2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import RestaurantInfo from "@/components/restaurant/RestaurantInfo";
import PopularItems from "@/components/restaurant/PopularItems";
import MenuSection from "@/components/restaurant/MenuSection";
import PhotosSection from "@/components/restaurant/PhotosSection";
import ReviewsSection from "@/components/restaurant/ReviewsSection";
import MatchScoreCard from "@/components/restaurant/MatchScoreCard";
import { useRestaurantData } from "@/hooks/useRestaurantData";

const RestaurantDetails = () => {
  const { id = '' } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { data: restaurant, isLoading, error } = useRestaurantData(id);

  const handleSave = () => {
    setIsSaving(true);
    console.log('Restaurant saved');
    
    toast({
      title: "Restaurant Saved!",
      description: "Added to your favorites",
      duration: 2000,
    });

    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const matchCategories = [
    {
      category: "Taste Profile",
      score: 90,
      description: "Matches your preference for spicy Asian cuisine",
      icon: "🌶️"
    },
    {
      category: "Price Range",
      score: 85,
      description: "Within your typical dining budget",
      icon: "💰"
    },
    {
      category: "Atmosphere",
      score: 95,
      description: "Casual dining with modern ambiance",
      icon: "✨"
    },
    {
      category: "Service",
      score: 88,
      description: "Known for attentive staff",
      icon: "👨‍🍳"
    }
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error loading restaurant details</h2>
          <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
          {error instanceof Error && error.message.includes('cors-anywhere') && (
            <Button
              onClick={() => window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank')}
              className="bg-primary text-white"
            >
              Request CORS Access
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="w-full h-[300px] relative">
          <img 
            src={restaurant?.photos?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
            alt="Restaurant hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="lg"
              className={`bg-primary text-white hover:bg-primary/90 transition-all duration-300 ${
                isSaving ? 'scale-105 bg-green-500' : ''
              }`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Check className="mr-2 h-5 w-5 animate-[scale-in_0.2s_ease-out]" />
              ) : (
                <BookmarkPlus className="mr-2 h-5 w-5" />
              )}
              {isSaving ? 'Saved!' : 'Save'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={() => console.log('Share clicked')}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {restaurant && <RestaurantInfo restaurant={restaurant} />}
              <PopularItems />
              <MenuSection />
              {restaurant && <PhotosSection photos={restaurant.photos} />}
              {restaurant?.googleReviews && <ReviewsSection reviews={restaurant.googleReviews} />}
            </div>

            <div className="space-y-8 md:sticky md:top-24 self-start">
              <MatchScoreCard categories={matchCategories} />
              
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Order Now</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "OpenTable", link: "#" },
                    { name: "DoorDash", link: "#" },
                    { name: "Uber Eats", link: "#" }
                  ].map((platform) => (
                    <Button
                      key={platform.name}
                      variant="outline"
                      className="w-full justify-between hover:bg-primary/5"
                      asChild
                    >
                      <a href={platform.link} target="_blank" rel="noopener noreferrer">
                        {platform.name}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantDetails;