import { useState } from "react";
import { Card } from "@/components/ui/card";
import PreferenceCard from "@/components/profile/preferences/PreferenceCard";
import { Beef, Fish, Egg, Drumstick, Salad } from "lucide-react";

const PROTEIN_OPTIONS = [
  { name: "Chicken", icon: <Drumstick />, emoji: "🍗" },
  { name: "Beef", icon: <Beef />, emoji: "🥩" },
  { name: "Fish", icon: <Fish />, emoji: "🐟" },
  { name: "Pork", icon: <Beef />, emoji: "🥓" },
  { name: "Tofu", icon: <Salad />, emoji: "🧊" },
  { name: "Eggs", icon: <Egg />, emoji: "🥚" },
  { name: "Turkey", icon: <Drumstick />, emoji: "🦃" },
  { name: "Lamb", icon: <Beef />, emoji: "🐑" },
  { name: "Shrimp", icon: <Fish />, emoji: "🦐" },
  { name: "Duck", icon: <Drumstick />, emoji: "🦆" },
];

interface ProteinStepProps {
  selected: string[];
  onChange: (proteins: string[]) => void;
}

const ProteinStep = ({ selected, onChange }: ProteinStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">Select Your Favorite Proteins</h2>
        <p className="text-muted-foreground text-center">
          Choose the proteins you enjoy most. This helps us find restaurants that serve your preferred options.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PROTEIN_OPTIONS.map((protein) => (
          <PreferenceCard
            key={protein.name}
            label={protein.name}
            icon={protein.icon}
            description={protein.emoji}
            selected={selected.includes(protein.name)}
            onClick={() => {
              if (selected.includes(protein.name)) {
                onChange(selected.filter((p) => p !== protein.name));
              } else {
                onChange([...selected, protein.name]);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProteinStep;