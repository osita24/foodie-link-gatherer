import { Slider } from "@/components/ui/slider";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpiceLevelSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const SpiceLevelSelector = ({ value, onChange }: SpiceLevelSelectorProps) => {
  const getSpiceColor = (level: number) => {
    switch (level) {
      case 1: return "text-yellow-500";
      case 2: return "text-orange-400";
      case 3: return "text-orange-500";
      case 4: return "text-red-500";
      case 5: return "text-red-600";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <Flame
            key={level}
            size={24}
            className={cn(
              "transition-colors",
              level <= value ? getSpiceColor(level) : "text-gray-300"
            )}
          />
        ))}
      </div>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        max={5}
        min={1}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>Mild</span>
        <span>Medium</span>
        <span>Hot</span>
      </div>
    </div>
  );
};

export default SpiceLevelSelector;