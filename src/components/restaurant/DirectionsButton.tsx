import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DirectionsButtonProps {
  address: string;
  name: string;
}

const DirectionsButton = ({ address, name }: DirectionsButtonProps) => {
  const handleGetDirections = () => {
    const encodedAddress = encodeURIComponent(`${name}, ${address}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  return (
    <Button 
      onClick={handleGetDirections}
      className="w-full md:w-auto"
      variant="secondary"
    >
      <MapPin className="w-4 h-4" />
      Get Directions
    </Button>
  );
};

export default DirectionsButton;