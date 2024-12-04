import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PreferenceCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

const PreferenceCard = ({ label, selected, onClick, icon }: PreferenceCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full p-4 rounded-lg transition-all duration-200",
        "border-2 hover:border-primary/50 hover:bg-accent/30",
        "flex items-center gap-3",
        selected ? "border-primary bg-accent shadow-sm" : "border-accent/50 bg-accent/20"
      )}
    >
      {icon && <div className="text-primary">{icon}</div>}
      <span className="text-left font-medium">{label}</span>
      {selected && (
        <div className="absolute top-2 right-2 text-primary">
          <Check size={16} />
        </div>
      )}
    </button>
  );
};

export default PreferenceCard;