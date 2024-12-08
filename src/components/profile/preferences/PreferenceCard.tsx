import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PreferenceCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  description?: string;
}

const PreferenceCard = ({ 
  label, 
  selected, 
  onClick, 
  icon,
  description 
}: PreferenceCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full px-3 py-2 rounded-lg transition-all duration-200",
        "border-2 hover:border-primary/50 hover:bg-accent/30",
        "flex flex-col items-start gap-1",
        selected ? "border-primary bg-accent shadow-sm" : "border-accent/50 bg-accent/20",
        description ? "h-20" : "h-16"
      )}
    >
      <div className="flex items-center gap-2 w-full">
        {icon && <div className="text-primary flex-shrink-0">{icon}</div>}
        <span className="text-left text-sm font-medium truncate flex-1">
          {label}
        </span>
      </div>
      {description && (
        <span className="text-xs text-muted-foreground">
          {description}
        </span>
      )}
      {selected && (
        <div className="absolute top-2 right-2 text-primary">
          <Check size={16} />
        </div>
      )}
    </button>
  );
};

export default PreferenceCard;