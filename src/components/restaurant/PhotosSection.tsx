import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PhotosSection = () => {
  const photos = [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
  ];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl">Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div 
              key={index} 
              className="aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              <img
                src={photo}
                alt={`Restaurant photo ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotosSection;