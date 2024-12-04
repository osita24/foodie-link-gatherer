import { Button } from "@/components/ui/button";
import { Share2, Bookmark, Star, Clock, Phone, MapPin, ExternalLink, List } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const RestaurantDetails = () => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleSave = () => {
    toast.success("Restaurant saved to favorites!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[60vh]">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
          alt="Restaurant interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 backdrop-blur-md hover:bg-white/30"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 backdrop-blur-md hover:bg-white/30"
            onClick={handleSave}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-secondary mb-2">Sample Restaurant</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span>4.5 (500+ reviews)</span>
                  </div>
                </div>
                <div className="bg-primary text-white px-6 py-3 rounded-full">
                  <span className="text-lg font-semibold">95% Match</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>123 Sample Street, City</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Open until 10:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>(123) 456-7890</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  <a href="#" className="text-primary hover:underline">Visit Website</a>
                </div>
              </div>
            </div>

            {/* Recommended Menu Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  Recommended Menu Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
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

            {/* Full Menu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-6 h-6" />
                  Full Menu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <TableRow key={item}>
                        <TableCell className="font-medium">Menu Item {item}</TableCell>
                        <TableCell>Delicious description of menu item {item}</TableCell>
                        <TableCell>${(10 + item).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Match Score Details */}
            <Card>
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
                        <div className="h-full bg-primary rounded-full" style={{ width: "90%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Options */}
            <Card>
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
                    className="w-full justify-between"
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

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-600">
                  <div>
                    <h3 className="font-semibold mb-2">Cuisine Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Italian", "Mediterranean", "European"].map((cuisine) => (
                        <span key={cuisine} className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Outdoor seating</li>
                      <li>Wheelchair accessible</li>
                      <li>Free Wi-Fi</li>
                      <li>Takes reservations</li>
                    </ul>
                  </div>
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