import { Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RestaurantHeaderProps {
  imageUrl: string;
}

const RestaurantHeader = ({ imageUrl }: RestaurantHeaderProps) => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleSave = () => {
    toast.success("Restaurant saved to favorites!");
  };

  return (
    <div className="relative h-[40vh] md:h-[60vh]">
      <img
        src={imageUrl}
        alt="Restaurant interior"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300"
          onClick={handleSave}
        >
          <Bookmark className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default RestaurantHeader;