import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface MenuHeaderProps {
  menuUrl?: string;
}

const MenuHeader = ({ menuUrl }: MenuHeaderProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative w-full bg-background rounded-lg p-6 mb-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-semibold">Menu Match</h2>
            <Badge 
              variant="secondary" 
              className="text-xs bg-accent/50 text-secondary/70"
            >
              Beta
            </Badge>
          </div>
          
          {!isAuthenticated && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign up to see how well this menu matches your preferences
              </p>
              <Button variant="default" className="w-full sm:w-auto">
                Sign up to see match score
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-2 text-center">
            <p>Menu information is automatically processed and continuously improving</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuHeader;