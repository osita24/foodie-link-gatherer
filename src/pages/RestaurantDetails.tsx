import RestaurantInfo from "@/components/restaurant/RestaurantInfo";
import PopularItems from "@/components/restaurant/PopularItems";
import MenuSection from "@/components/restaurant/MenuSection";
import PhotosSection from "@/components/restaurant/PhotosSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink } from "lucide-react";

const RestaurantDetails = () => {
  return (
    <div className="min-h-screen bg-background pt-8">
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
          <div className="space-y-8 md:sticky md:top-8 self-start">
            {/* Match Score Details */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Why We Think You'll Love It</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Taste Profile", "Price Range", "Atmosphere", "Service"].map((category) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{category}</span>
                        <span className="text-primary font-semibold">90%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: "90%" }} 
                        />
                      </div>
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
  );
};

export default RestaurantDetails;