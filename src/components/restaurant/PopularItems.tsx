import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PopularItems = () => {
  const popularItems = [
    {
      name: "Signature Pasta",
      image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
      price: "$24.99",
      description: "House-made pasta with truffle cream sauce"
    },
    {
      name: "Wagyu Steak",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947",
      price: "$59.99",
      description: "Premium grade wagyu with seasonal vegetables"
    },
    {
      name: "Fresh Seafood Platter",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de",
      price: "$45.99",
      description: "Daily selection of fresh seafood"
    }
  ];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl">Popular Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {popularItems.map((item, index) => (
            <div 
              key={index}
              className="flex gap-3 p-3 rounded-lg border border-gray-100 
                hover:shadow-md transition-all duration-300 bg-white group"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover group-hover:shadow-md transition-all duration-300"
              />
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-semibold text-secondary text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.description}</p>
                </div>
                <p className="text-primary font-semibold text-sm">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularItems;