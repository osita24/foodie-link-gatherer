import { LucideIcon } from "lucide-react";

interface InfoFeatureProps {
  icon: LucideIcon;
  label: string;
}

const InfoFeature = ({ icon: Icon, label }: InfoFeatureProps) => {
  console.log("Rendering InfoFeature:", label);
  
  return (
    <span
      className="px-3 py-1 bg-accent/50 rounded-full text-sm flex items-center gap-1.5 
                hover:bg-accent transition-colors duration-200 cursor-default"
    >
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span className="text-secondary">{label}</span>
    </span>
  );
};

export default InfoFeature;