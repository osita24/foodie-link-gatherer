import { MapPin } from "lucide-react";

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
    <div 
      onClick={handleGetDirections}
      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 cursor-pointer transition-colors"
    >
      <MapPin className="w-5 h-5" />
      <span className="text-sm font-medium">Directions</span>
    </div>
  );
};

export default DirectionsButton;