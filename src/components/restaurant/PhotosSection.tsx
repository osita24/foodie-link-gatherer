import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

interface PhotosSectionProps {
  photos: string[];
}

const PhotosSection = ({ photos }: PhotosSectionProps) => {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6" />
          Photos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {photos.slice(0, 6).map((photo, index) => (
            <div 
              key={index} 
              className="aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              <img
                src={photo}
                alt={`Restaurant photo ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotosSection;