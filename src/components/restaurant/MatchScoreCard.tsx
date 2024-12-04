import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface MatchCategory {
  category: string;
  score: number;
  description: string;
  icon: string;
}

interface MatchScoreCardProps {
  categories: MatchCategory[];
}

const MatchScoreCard = ({ categories }: MatchScoreCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
          Why We Think You'll Love It
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {categories.map((item, index) => (
            <div
              key={item.category}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg">{item.icon}</span>
                  <span className="font-medium text-secondary text-xs sm:text-sm">
                    {item.category}
                  </span>
                </div>
                <span className="text-primary font-bold text-xs sm:text-sm">
                  {item.score}%
                </span>
              </div>
              <div className="relative">
                <div className="overflow-hidden h-1 sm:h-1.5 text-xs flex rounded-full bg-gray-100">
                  <div
                    style={{ width: `${item.score}%` }}
                    className="animate-[slideRight_1s_ease-out] shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                  />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchScoreCard;