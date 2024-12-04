import { Star, Clock, Phone, MapPin, ExternalLink } from "lucide-react";

const RestaurantInfo = () => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg -mt-20 relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Sample Restaurant</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span>4.5 (500+ reviews)</span>
          </div>
        </div>
        <div className="bg-primary text-white px-6 py-3 rounded-full animate-fade-in">
          <span className="text-lg font-semibold">95% Match</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
        <div className="flex items-center gap-2 hover:text-primary transition-colors">
          <MapPin className="w-5 h-5" />
          <span>123 Sample Street, City</span>
        </div>
        <div className="flex items-center gap-2 hover:text-primary transition-colors">
          <Clock className="w-5 h-5" />
          <span>Open until 10:00 PM</span>
        </div>
        <div className="flex items-center gap-2 hover:text-primary transition-colors">
          <Phone className="w-5 h-5" />
          <span>(123) 456-7890</span>
        </div>
        <div className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          <a href="#" className="text-primary hover:underline">Visit Website</a>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfo;