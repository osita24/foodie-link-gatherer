import { ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MenuHeaderProps {
  menuUrl?: string;
}

const MenuHeader = ({ menuUrl }: MenuHeaderProps) => {
  return (
    <div className="bg-primary/5 p-6 text-center border-b border-primary/10">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-serif text-secondary">Menu</h2>
          <Badge 
            variant="secondary" 
            className="text-xs bg-accent/50 text-secondary/70 hover:bg-accent/70"
          >
            <Sparkles className="w-3 h-3 mr-1 inline-block" />
            AI Enhanced Beta
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Menu information is automatically processed and continuously improving
        </p>
        {menuUrl && (
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
          >
            <span>View full menu</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};

export default MenuHeader;