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
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Star className="w-6 h-6 text-yellow-400 fill-current" />
          Why We Think You'll Love It
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {categories.map((item, index) => (
            <div
              key={item.category}
              className="space-y-2 animate-fade-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium text-secondary">
                    {item.category}
                  </span>
                </div>
                <span className="text-primary font-bold">
                  {item.score}%
                </span>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                  <div
                    style={{ width: `${item.score}%` }}
                    className="animate-[slideRight_1s_ease-out] shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchScoreCard;