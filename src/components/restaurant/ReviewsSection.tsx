import { useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Review {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  if (!reviews?.length) {
    return null;
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Customer Reviews</CardTitle>
        <Button
          variant="outline"
          onClick={() => setShowAllReviews(!showAllReviews)}
          className="ml-4"
        >
          {showAllReviews ? "Show Less" : `See All (${reviews.length})`}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {displayedReviews.map((review, index) => (
          <div 
            key={index} 
            className="border-b last:border-b-0 pb-6 last:pb-0 animate-fade-in"
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.profile_photo_url} alt={review.author_name} />
                <AvatarFallback>{review.author_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{review.author_name}</h4>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(review.time * 1000, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center mt-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mt-2 line-clamp-3">{review.text}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ReviewsSection;