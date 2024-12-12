import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface PreferencesSectionProps {
  value: string;
  title: string;
  selectedCount?: number;
  children: React.ReactNode;
}

const PreferencesSection = ({ value, title, selectedCount, children }: PreferencesSectionProps) => {
  return (
    <AccordionItem value={value} className="border rounded-lg bg-white shadow-sm">
      <AccordionTrigger className="px-4 py-3">
        <div className="flex items-center gap-3 w-full">
          <span className="text-base md:text-lg font-medium">{title}</span>
          {selectedCount !== undefined && selectedCount > 0 && (
            <span className="text-sm text-gray-500">
              ({selectedCount} selected)
            </span>
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