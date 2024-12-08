import { Card, CardContent } from "@/components/ui/card";

const SavedRestaurantsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden animate-pulse">
          <div className="h-48 bg-accent/50" />
          <CardContent className="p-4">
            <div className="h-6 bg-accent/50 rounded w-3/4 mb-2" />
            <div className="h-4 bg-accent/50 rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedRestaurantsSkeleton;