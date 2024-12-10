import { Badge } from "@/components/ui/badge";
import { Leaf, Wheat, Ban, Scale, Milk } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DietaryBadge {
  icon: JSX.Element;
  label: string;
  description: string;
}

const dietaryBadges: Record<string, DietaryBadge> = {
  vegetarian: {
    icon: <Leaf className="h-3 w-3" />,
    label: "Vegetarian",
    description: "Suitable for vegetarians"
  },
  vegan: {
    icon: <Leaf className="h-3 w-3" />,
    label: "Vegan",
    description: "100% plant-based"
  },
  "gluten-free": {
    icon: <Wheat className="h-3 w-3" />,
    label: "Gluten-Free",
    description: "Contains no gluten"
  },
  "dairy-free": {
    icon: <Milk className="h-3 w-3" />,
    label: "Dairy-Free",
    description: "Contains no dairy products"
  },
  "nut-free": {
    icon: <Ban className="h-3 w-3" />,
    label: "Nut-Free",
    description: "Contains no nuts"
  },
  "low-carb": {
    icon: <Scale className="h-3 w-3" />,
    label: "Low-Carb",
    description: "Low in carbohydrates"
  }
};

interface DietaryBadgesProps {
  badges: string[];
}

const DietaryBadges = ({ badges }: DietaryBadgesProps) => {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {badges.map((badge) => {
        const dietaryInfo = dietaryBadges[badge.toLowerCase()];
        if (!dietaryInfo) return null;

        return (
          <TooltipProvider key={badge}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="text-xs py-0 h-5 bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  {dietaryInfo.icon}
                  <span className="ml-1">{dietaryInfo.label}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{dietaryInfo.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default DietaryBadges;