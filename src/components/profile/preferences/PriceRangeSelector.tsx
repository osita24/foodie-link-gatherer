import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";
import { PriceRange } from "@/types/preferences";

interface PriceRangeSelectorProps {
  value: PriceRange;
  onChange: (value: PriceRange) => void;
}

const PriceRangeSelector = ({ value, onChange }: PriceRangeSelectorProps) => {
  const priceRanges: { value: PriceRange; label: string; icons: number }[] = [
    { value: "budget", label: "Budget Friendly", icons: 1 },
    { value: "moderate", label: "Moderate", icons: 2 },
    { value: "upscale", label: "Upscale", icons: 3 },
    { value: "luxury", label: "Luxury", icons: 4 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {priceRanges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            "p-4 rounded-lg transition-all duration-200",
            "border-2 hover:border-primary/50",
            value === range.value 
              ? "border-primary bg-accent shadow-sm" 
              : "border-accent/50 bg-accent/20"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-0.5 px-3 py-1.5 bg-white/50 rounded-full">
              {[...Array(range.icons)].map((_, i) => (
                <DollarSign
                  key={i}
                  size={14}
                  className={cn(
                    "transition-colors",
                    value === range.value 
                      ? "text-primary fill-primary/20" 
                      : "text-gray-400",
                  )}
                  strokeWidth={2.5}
                />
              ))}
              {[...Array(4 - range.icons)].map((_, i) => (
                <DollarSign
                  key={i + range.icons}
                  size={14}
                  className="text-gray-300"
                  strokeWidth={2.5}
                />
              ))}
            </div>
            <span className="font-medium text-sm">{range.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PriceRangeSelector;