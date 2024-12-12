import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface PreferencesSectionProps {
  value: string;
  title: string;
  selectedCount?: number;
  children: React.ReactNode;
}

const PreferencesSection = ({ value, title, selectedCount, children }: PreferencesSectionProps) => {
  return (
    <AccordionItem 
      value={value} 
      className="border rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <AccordionTrigger className="px-4 py-3">
        <div className="flex items-center gap-3 w-full">
          <span className="text-base md:text-lg font-medium">{title}</span>
          {selectedCount !== undefined && selectedCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedCount} selected
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default PreferencesSection;