import { RestaurantDetails } from "@/types/restaurant";
import MatchScoreCard from "../MatchScoreCard";
import OrderSection from "../OrderSection";

interface SidebarProps {
  matchCategories: Array<{
    category: string;
    score: number;
    description: string;
    icon: string;
  }>;
}

const Sidebar = ({ matchCategories }: SidebarProps) => {
  return (
    <div className="hidden lg:block space-y-6 lg:sticky lg:top-24 self-start">
      <MatchScoreCard categories={matchCategories} />
      <OrderSection />
    </div>
  );
};

export default Sidebar;