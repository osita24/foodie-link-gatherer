import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getShareableUrl } from "@/utils/sharing";

interface ShareButtonProps {
  placeId: string | undefined;
}

const ShareButton = ({ placeId }: ShareButtonProps) => {
  const handleShare = async () => {
    try {
      console.log("🔗 Starting share operation for place ID:", placeId);
      const shareUrl = getShareableUrl(placeId);
      console.log("📋 Generated share URL:", shareUrl);
      
      const shareData = {
        title: 'Check out this restaurant on Cilantro',
        text: 'I found this great restaurant on Cilantro!',
        url: shareUrl
      };

      // Check if native sharing is available and device is mobile
      if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        console.log("📱 Using native share on mobile");
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        console.log("📋 Copying to clipboard on desktop");
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error('❌ Error sharing:', error);
      // Fallback to a temporary input element if clipboard API fails
      try {
        const shareUrl = getShareableUrl(placeId);
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        toast.success("Link copied to clipboard!");
      } catch (fallbackError) {
        console.error('❌ Fallback sharing failed:', fallbackError);
        toast.error("Failed to share restaurant");
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="bg-white/80 backdrop-blur-sm hover:bg-white w-full sm:w-auto shadow-lg text-base px-6"
      onClick={handleShare}
    >
      <Share2 className="mr-2 h-6 w-6" />
      Share
    </Button>
  );
};

export default ShareButton;