import { LucideIcon } from "lucide-react";

interface InfoFeatureProps {
  icon: LucideIcon;
  label: string;
}

const InfoFeature = ({ icon: Icon, label }: InfoFeatureProps) => {
  console.log("Rendering InfoFeature:", label);
  
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full 
                  hover:bg-accent/30 transition-colors duration-200 cursor-default
                  border border-accent/10">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span className="text-sm font-medium text-secondary">{label}</span>
    </div>
  );
};

export default InfoFeature;