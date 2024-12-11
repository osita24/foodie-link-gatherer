import { useState } from "react";
import { Card } from "@/components/ui/card";
import PreferenceCard from "@/components/profile/preferences/PreferenceCard";

const PROTEIN_OPTIONS = [
  "Chicken",
  "Beef",
  "Fish",
  "Pork",
  "Tofu",
  "Eggs",
  "Turkey",
  "Lamb",
  "Shrimp",
  "Duck",
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
            key={protein}
            label={protein}
            selected={selected.includes(protein)}
            onClick={() => {
              if (selected.includes(protein)) {
                onChange(selected.filter((p) => p !== protein));
              } else {
                onChange([...selected, protein]);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProteinStep;