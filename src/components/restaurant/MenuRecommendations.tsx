import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

const MenuRecommendations = () => {
  const recommendations = [
    {
      name: "Chef's Special Ramen",
      description: "Our signature ramen with 24-hour broth",
      price: "$18.99",
      tag: "Chef's Choice"
    },
    {
      name: "Truffle Risotto",
      description: "Creamy risotto with seasonal truffles",
      price: "$32.99",
      tag: "Most Popular"
    },
    {
      name: "Seasonal Tasting Menu",
      description: "Five-course seasonal experience",
      price: "$89.99",
      tag: "Limited Time"
    }
  ];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          Recommended For You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {recommendations.map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 
                hover:shadow-md transition-all duration-300 bg-white"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-secondary">{item.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {item.tag}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <p className="text-primary font-semibold ml-4">{item.price}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuRecommendations;