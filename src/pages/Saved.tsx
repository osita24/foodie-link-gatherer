import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import SavedRestaurants from "@/components/profile/SavedRestaurants";
import Header from "@/components/Header";
import AuthModal from "@/components/auth/AuthModal";

const Saved = () => {
  const session = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AuthModal 
          open={true}
          onOpenChange={setShowAuthModal}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-20 px-4">
        <h1 className="text-2xl font-bold mb-6">Saved Restaurants</h1>
        <SavedRestaurants />
      </div>
    </div>
  );
};

export default Saved;