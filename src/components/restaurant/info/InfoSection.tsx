import { LucideIcon } from "lucide-react";
import InfoFeature from "./InfoFeature";

interface Feature {
  available: boolean;
  label: string;
  icon: LucideIcon;
}

interface InfoSectionProps {
  features: Feature[];
}

const InfoSection = ({ features }: InfoSectionProps) => {
  console.log("Rendering InfoSection with features:", features);
  
  if (!features.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {features.map(feature => (
        <InfoFeature
          key={feature.label}
          icon={feature.icon}
          label={feature.label}
        />
      ))}
    </div>
  );
};

export default InfoSection;