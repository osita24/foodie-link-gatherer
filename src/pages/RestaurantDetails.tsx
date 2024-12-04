import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  Clock,
  Phone,
  MapPin,
  ArrowLeft,
  Share2,
  Heart,
  ExternalLink,
  Info,
  Calendar
} from "lucide-react";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // This would be replaced with actual data from your API
  const restaurantData = {
    name: "Sample Restaurant",
    rating: 4.5,
    googleReviews: 328,
    matchScore: 8.2,
    priceRange: "$$$",
    cuisine: "Contemporary American",
    address: "123 Main St, City, State",
    phone: "(555) 123-4567",
    website: "https://example.com",
    hours: {
      monday: "11:00 AM - 10:00 PM",
      tuesday: "11:00 AM - 10:00 PM",
      wednesday: "11:00 AM - 10:00 PM",
      thursday: "11:00 AM - 11:00 PM",
      friday: "11:00 AM - 11:00 PM",
      saturday: "10:00 AM - 11:00 PM",
      sunday: "10:00 AM - 9:00 PM"
    },
    description: "A cozy restaurant serving delicious contemporary American cuisine in a warm atmosphere. Known for our farm-to-table approach and seasonal menu.",
    photos: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"],
    features: ["Outdoor Seating", "Full Bar", "Wheelchair Accessible", "Takes Reservations"],
    popularDishes: ["Truffle Mac & Cheese", "Wagyu Burger", "Seasonal Risotto"],
    menu: [
      {
        category: "Appetizers",
        items: [
          { name: "Truffle Fries", price: "$12.99", recommended: true, description: "Hand-cut fries tossed with truffle oil and parmesan" },
          { name: "Burrata", price: "$16.99", recommended: false, description: "Fresh burrata with heirloom tomatoes and basil" },
        ]
      },
      {
        category: "Main Course",
        items: [
          { name: "Wagyu Burger", price: "$24.99", recommended: true, description: "Premium wagyu beef with aged cheddar and caramelized onions" },
          { name: "Seasonal Risotto", price: "$26.99", recommended: true, description: "Creamy arborio rice with seasonal vegetables" },
        ]
      }
    ]
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: restaurantData.name,
        text: `Check out ${restaurantData.name} on FindDine!`,
        url: window.location.href,
      });
    } catch (err) {
      toast({
        title: "Copied to clipboard!",
        description: "Share the link with your friends.",
      });
    }
  };

  const handleSave = () => {
    toast({
      title: "Restaurant saved!",
      description: "You can find it in your favorites.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Header */}
      <div className="relative h-[400px] bg-gradient-to-r from-primary to-primary/80">
        <div className="absolute inset-0 bg-black/40">
          <img 
            src={restaurantData.photos[0]} 
            alt={restaurantData.name}
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-white hover:bg-white/20"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{restaurantData.name}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1 fill-yellow-400" />
                    <span>{restaurantData.rating}</span>
                    <span className="text-sm ml-1">({restaurantData.googleReviews} reviews)</span>
                  </div>
                  <span>•</span>
                  <span>{restaurantData.priceRange}</span>
                  <span>•</span>
                  <span>{restaurantData.cuisine}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="secondary" onClick={handleSave}>
                  <Heart className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            {/* Quick Info */}
            <Card className="animate-fade-up">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Location</h3>
                      <p className="text-gray-600">{restaurantData.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-gray-600">{restaurantData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ExternalLink className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Website</h3>
                      <a href={restaurantData.website} target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline">{restaurantData.website}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Features</h3>
                      <p className="text-gray-600">{restaurantData.features.join(" • ")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="animate-fade-up">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Hours of Operation</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(restaurantData.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-2 border-b last:border-0">
                      <span className="capitalize">{day}</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Menu */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Menu Highlights</h2>
              {restaurantData.menu.map((category, index) => (
                <div key={index} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <h3 className="text-xl font-medium mb-4">{category.category}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {category.items.map((item, itemIndex) => (
                      <Card key={itemIndex} className={`
                        transform transition-all duration-300 hover:scale-[1.01]
                        ${item.recommended ? 'border-primary/50 bg-primary/5' : ''}
                      `}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{item.name}</p>
                                {item.recommended && (
                                  <span className="text-sm text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <span className="font-semibold text-lg">{item.price}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Match Score and Popular Items */}
          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Match Score</h2>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl font-bold text-primary">
                          {restaurantData.matchScore}
                        </span>
                        <span className="text-lg text-primary">/10</span>
                      </div>
                    </div>
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-primary"
                        strokeDasharray={`${2 * Math.PI * 60 * (restaurantData.matchScore / 10)} ${2 * Math.PI * 60}`}
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-center mt-4 text-gray-600">
                  Based on your preferences and past dining history, this restaurant is a great match for you!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Popular Dishes</h2>
                <div className="space-y-3">
                  {restaurantData.popularDishes.map((dish, index) => (
                    <div key={index} className="flex items-center gap-2 py-2 border-b last:border-0">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>{dish}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;