import ActionButtons from "@/components/restaurant/ActionButtons";

interface RestaurantHeroProps {
  photoUrl?: string;
}

const RestaurantHero = ({ photoUrl }: RestaurantHeroProps) => {
  return (
    <div className="w-full h-[30vh] sm:h-[40vh] md:h-[50vh] relative">
      <img 
        src={photoUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
        alt="Restaurant hero"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <ActionButtons />
    </div>
  );
};

export default RestaurantHero;