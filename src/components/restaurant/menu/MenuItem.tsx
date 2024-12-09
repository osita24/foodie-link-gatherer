import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MenuItem as MenuItemType } from "@/types/restaurant";
import MenuItemDescription from "./MenuItemDescription";
import MenuItemMatchBadge from "./MenuItemMatchBadge";
import { Crown } from "lucide-react";

interface MenuItemProps {
  item: MenuItemType;
  matchDetails?: {
    score: number;
    matchType?: string;
    reason?: string;
    warning?: string;
  } | null;
  isTopMatch?: boolean;
}

const MenuItem = ({ item, matchDetails, isTopMatch }: MenuItemProps) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(item.price);

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-secondary leading-tight break-words">
              {item.name}
            </h3>
          </div>
          <div className="flex-shrink-0">
            <span className="font-medium text-primary whitespace-nowrap">
              {formattedPrice}
            </span>
          </div>
        </div>

        <MenuItemDescription description={item.description} />

        <div className="mt-auto pt-3 flex flex-wrap items-center gap-2">
          {matchDetails && (
            <MenuItemMatchBadge
              score={matchDetails.score}
              reason={matchDetails.reason}
              warning={matchDetails.warning}
            />
          )}
          
          {item.category && (
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
          )}
          
          {isTopMatch && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="default" className="bg-yellow-500/10 text-yellow-600 border-yellow-200 gap-1">
                    <Crown className="h-3 w-3" />
                    <span>Top Match</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Best match for your preferences</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MenuItem;