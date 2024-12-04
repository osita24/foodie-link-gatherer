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
        <CardTitle className="text-2xl">Popular Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {popularItems.map((item, index) => (
            <div 
              key={index}
              className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02] bg-white"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-secondary">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <p className="text-primary font-semibold mt-2">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularItems;