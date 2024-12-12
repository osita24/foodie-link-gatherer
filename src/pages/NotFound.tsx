import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md animate-fade-up">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary">Page Not Found</h2>
        <p className="text-gray-600">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;