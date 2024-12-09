import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PhotosSectionProps {
  photos?: string[];
}

const PhotosSection = ({ photos = [] }: PhotosSectionProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  if (!photos || photos.length === 0) {
    return null;
  }

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Camera className="w-6 h-6" />
            Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {photos.slice(0, 6).map((photo, index) => (
              <div 
                key={index} 
                className="relative aspect-square group cursor-zoom-in"
                onClick={() => setSelectedPhoto(photo)}
              >
                {!loadedImages.has(index) && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />
                )}
                <img
                  src={photo}
                  alt={`Restaurant photo ${index + 1}`}
                  className={`w-full h-full object-cover rounded-lg transition-all duration-300 
                    group-hover:scale-[1.02] group-hover:shadow-lg
                    ${loadedImages.has(index) ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                  onLoad={() => handleImageLoad(index)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog 
        open={!!selectedPhoto} 
        onOpenChange={() => setSelectedPhoto(null)}
      >
        <DialogContent className="max-w-4xl p-1 overflow-hidden sm:p-2">
          {selectedPhoto && (
            <div className="relative group">
              <img
                src={selectedPhoto}
                alt="Restaurant photo"
                className="w-full h-auto rounded-lg"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotosSection;