import { Check, X } from "lucide-react";
import { RestaurantDetails } from "@/types/restaurant";

interface AmenitiesSectionProps {
  restaurant: RestaurantDetails;
}

const AmenitiesSection = ({ restaurant }: AmenitiesSectionProps) => {
  const amenities = [
    { label: "Wheelchair Accessible", value: restaurant.wheelchairAccessible },
    { label: "Serves Beer", value: restaurant.servesBeer },
    { label: "Serves Wine", value: restaurant.servesWine },
    { label: "Serves Breakfast", value: restaurant.servesBreakfast },
    { label: "Serves Brunch", value: restaurant.servesBrunch },
    { label: "Serves Lunch", value: restaurant.servesLunch },
    { label: "Serves Dinner", value: restaurant.servesDinner },
    { label: "Serves Vegetarian Food", value: restaurant.servesVegetarianFood },
    { label: "Reservations Available", value: restaurant.reservable },
    { label: "Delivery Available", value: restaurant.delivery },
    { label: "Takeout Available", value: restaurant.takeout },
    { label: "Dine-in Available", value: restaurant.dineIn },
  ].filter(amenity => amenity.value !== undefined);

  if (amenities.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-4">Amenities & Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {amenities.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2">
            {value ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <X className="w-5 h-5 text-error" />
            )}
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmenitiesSection;