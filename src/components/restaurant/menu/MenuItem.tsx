import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy } from "lucide-react";

interface MenuItemProps {
  item: {
    name: string;
    description?: string;
    price?: string;
    category?: string;
    image?: string;
    popular?: boolean;
  };
  matchDetails?: {
    score: number;
    reason?: string;
    warning?: string;
  };
}

const MenuItem = ({ item, matchDetails }: MenuItemProps) => {
  const isTopMatch = matchDetails?.score >= 90;

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-md
      ${isTopMatch ? 'bg-gradient-to-br from-primary/5 to-accent/10 border-accent/20' : 'bg-white'}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {item.image && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-secondary truncate pr-4">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
              
              {item.price && (
                <span className="text-sm font-medium whitespace-nowrap">
                  ${item.price}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              {isTopMatch && (
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium animate-fade-up">
                  <Trophy className="w-3 h-3" />
                  Top Match
                </div>
              )}
              
              {matchDetails?.score && matchDetails.score > 50 && !isTopMatch && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="w-3 h-3" />
                  {matchDetails.score}% match
                </div>
              )}

              {item.popular && (
                <Badge variant="outline" className="text-xs">
                  Popular
                </Badge>
              )}
            </div>

            {(matchDetails?.reason || matchDetails?.warning) && (
              <p className="text-xs text-muted-foreground mt-1.5">
                {matchDetails.warning ? (
                  <span className="text-warning">{matchDetails.warning}</span>
                ) : (
                  matchDetails.reason
                )}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuItem;