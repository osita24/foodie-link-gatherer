import { useState } from "react";
import { BookmarkPlus, Check, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SaveButtonProps {
  placeId: string;
  isSaved: boolean;
  session: any;
  onAuthRequired: () => void;
  restaurant: any;
}

const SaveButton = ({ placeId, isSaved, session, onAuthRequired, restaurant }: SaveButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!session) {
      onAuthRequired();
      return;
    }

    if (!restaurant) {
      toast.error("Restaurant information not available");
      return;
    }

    try {
      setIsSaving(true);
      console.log("💾 Starting save operation for restaurant:", restaurant);

      if (isSaved) {
        const { error } = await supabase
          .from('saved_restaurants')
          .delete()
          .eq('user_id', session.user.id)
          .eq('place_id', placeId);

        if (error) throw error;

        toast.success("Restaurant removed from your saved list");
      } else {
        const restaurantData = {
          user_id: session.user.id,
          place_id: placeId,
          name: restaurant.name || 'Unnamed Restaurant',
          image_url: restaurant.photos?.[0] || null,
          cuisine: restaurant.types?.[0] || null,
          rating: restaurant.rating || null,
          address: restaurant.address || null,
        };

        console.log("📝 Saving restaurant data:", restaurantData);

        const { error } = await supabase
          .from('saved_restaurants')
          .insert(restaurantData);

        if (error) {
          console.error("❌ Error saving restaurant:", error);
          throw error;
        }

        toast.success("Restaurant saved to your list!");
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
      toast.error("Failed to update saved restaurants");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      size="lg"
      className={`bg-primary text-white hover:bg-primary/90 transition-all duration-300 w-full sm:w-auto shadow-lg text-base px-6
        ${isSaving ? 'scale-105 bg-green-500' : ''}`}
      onClick={handleSave}
      disabled={isSaving}
    >
      {isSaving ? (
        <Check className="mr-2 h-6 w-6 animate-[scale-in_0.2s_ease-out]" />
      ) : isSaved ? (
        <BookmarkCheck className="mr-2 h-6 w-6" />
      ) : (
        <BookmarkPlus className="mr-2 h-6 w-6" />
      )}
      {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
    </Button>
  );
};

export default SaveButton;