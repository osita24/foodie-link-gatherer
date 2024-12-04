import RestaurantInfo from "@/components/restaurant/RestaurantInfo";
import PopularItems from "@/components/restaurant/PopularItems";
import MenuSection from "@/components/restaurant/MenuSection";
import PhotosSection from "@/components/restaurant/PhotosSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, BookmarkPlus, Share2, Check } from "lucide-react";
import Header from "@/components/Header";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const RestaurantDetails = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsSaving(true);
    console.log('Restaurant saved');
    
    toast({
      title: "Restaurant Saved!",
      description: "Added to your favorites",
      duration: 2000,
    });

    // Reset the animation after 1 second
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Hero Image Section */}
        <div className="w-full h-[300px] relative">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
            alt="Restaurant hero"
            className="w-full h-full object-cover"
          />
          {/* Action Buttons */}
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
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              <RestaurantInfo />
              
              {/* Popular Items Section */}
              <PopularItems />

              {/* Recommended Menu Items */}
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    Recommended Menu Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02] bg-white">
                        <img
                          src={`https://picsum.photos/100/100?random=${item}`}
                          alt="Menu item"
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-secondary">Menu Item {item}</h3>
                          <p className="text-sm text-gray-600 mt-1">Description of the menu item goes here</p>
                          <p className="text-primary font-semibold mt-2">$15.99</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Full Menu Section */}
              <MenuSection />

              {/* Photos Section */}
              <PhotosSection />
            </div>

            {/* Sidebar */}
            <div className="space-y-8 md:sticky md:top-24 self-start">
              {/* Match Score Details */}
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    Why We Think You'll Love It
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {matchCategories.map((item, index) => (
                      <div
                        key={item.category}
                        className="space-y-2 animate-fade-up"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium text-secondary">
                              {item.category}
                            </span>
                          </div>
                          <span className="text-primary font-bold">
                            {item.score}%
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                            <div
                              style={{ width: `${item.score}%` }}
                              className="animate-[slideRight_1s_ease-out] shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Options */}
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
