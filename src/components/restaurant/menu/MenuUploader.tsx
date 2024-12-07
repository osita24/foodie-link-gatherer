import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MenuUploaderProps {
  restaurantId: string;
  onUploadComplete: (menuData: any) => void;
}

const MenuUploader = ({ restaurantId, onUploadComplete }: MenuUploaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, HEIC)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Processing menu image:', file.name);
      
      // Create form data for the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('restaurantId', restaurantId);

      const { data, error } = await supabase.functions.invoke('menu-processor', {
        body: { file: formData }
      });

      if (error) throw error;

      console.log('Menu processing complete:', data);
      onUploadComplete(data);
      toast.success('Menu processed successfully');
      
    } catch (error) {
      console.error('Error processing menu:', error);
      toast.error('Failed to process menu');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraCapture = () => {
    // Create a hidden file input for camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileUpload(file);
    };
    
    input.click();
  };

  const handleGallerySelect = () => {
    // Create a hidden file input for gallery selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileUpload(file);
    };
    
    input.click();
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Processing menu image...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={handleCameraCapture}
          disabled={isProcessing}
          className="w-full"
          variant="outline"
        >
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
        <Button
          onClick={handleGallerySelect}
          disabled={isProcessing}
          className="w-full"
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Upload a clear photo of the menu to help others
      </p>
    </div>
  );
};

export default MenuUploader;