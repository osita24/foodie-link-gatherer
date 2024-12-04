import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Phone, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // This would be replaced with actual data from your API
  const restaurantData = {
    name: "Sample Restaurant",
    rating: 4.5,
    matchScore: 8.2,
    address: "123 Main St, City, State",
    phone: "(555) 123-4567",
    hours: "9:00 AM - 10:00 PM",
    description: "A cozy restaurant serving delicious meals in a warm atmosphere.",
    photos: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"],
    menu: [
      {
        category: "Appetizers",
        items: [
          { name: "Bruschetta", price: "$8.99", recommended: true },
          { name: "Calamari", price: "$12.99", recommended: false },
        ]
      },
      {
        category: "Main Course",
        items: [
          { name: "Grilled Salmon", price: "$24.99", recommended: true },
          { name: "Pasta Carbonara", price: "$18.99", recommended: true },
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="relative h-64 bg-gradient-to-r from-primary to-primary/80">
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
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-24">
        <Card className="animate-fade-up">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{restaurantData.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span>{restaurantData.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-1" />
                      <span>{restaurantData.hours}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                    <span>{restaurantData.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-gray-500 mt-1" />
                    <span>{restaurantData.phone}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">Menu Highlights</h2>
                  <div className="space-y-6">
                    {restaurantData.menu.map((category, index) => (
                      <div key={index} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <h3 className="text-lg font-medium mb-3">{category.category}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {category.items.map((item, itemIndex) => (
                            <Card key={itemIndex} className={`
                              transform transition-all duration-300 hover:scale-[1.02]
                              ${item.recommended ? 'border-primary/50 bg-primary/5' : ''}
                            `}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    {item.recommended && (
                                      <span className="text-sm text-primary">Recommended for you</span>
                                    )}
                                  </div>
                                  <span className="font-semibold">{item.price}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match Score */}
              <div>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Match Score</h2>
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold text-primary">
                            {restaurantData.matchScore}
                          </span>
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
                      Based on your preferences, this restaurant is a great match for you!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantDetails;