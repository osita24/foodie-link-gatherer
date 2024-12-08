import { useState } from "react";
import { UserPreferences } from "@/types/preferences";
import { Accordion } from "@/components/ui/accordion";
import PreferencesSection from "./PreferencesSection";
import CuisinePreferences from "./CuisinePreferences";
import DietaryPreferences from "./DietaryPreferences";
import AtmospherePreferences from "./AtmospherePreferences";
import AvoidancePreferences from "./AvoidancePreferences";
import ProteinPreferences from "./ProteinPreferences";

interface PreferencesFormProps {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}

const PreferencesForm = ({ preferences, onChange }: PreferencesFormProps) => {
  return (
    <Accordion 
      type="single" 
      collapsible 
      className="w-full space-y-4"
    >
      <PreferencesSection 
        value="dietary" 
        title="Dietary Preferences"
        selectedCount={preferences.dietaryRestrictions.length}
      >
        <div className="pt-2">
          <DietaryPreferences
            selected={preferences.dietaryRestrictions}
            onChange={(restrictions) => onChange({ ...preferences, dietaryRestrictions: restrictions })}
          />
        </div>
      </PreferencesSection>

      <PreferencesSection 
        value="proteins" 
        title="Favorite Proteins"
        selectedCount={preferences.favoriteProteins.length}
      >
        <div className="pt-2">
          <ProteinPreferences
            selected={preferences.favoriteProteins}
            onChange={(proteins) => onChange({ ...preferences, favoriteProteins: proteins })}
          />
        </div>
      </PreferencesSection>

      <PreferencesSection 
        value="cuisines" 
        title="Cuisine Preferences"
        selectedCount={preferences.cuisinePreferences.length}
      >
        <div className="pt-2">
          <CuisinePreferences 
            selected={preferences.cuisinePreferences}
            onChange={(cuisines) => onChange({ ...preferences, cuisinePreferences: cuisines })}
          />
        </div>
      </PreferencesSection>

      <PreferencesSection 
        value="avoidance" 
        title="Foods to Avoid"
        selectedCount={preferences.foodsToAvoid.length}
      >
        <div className="pt-2">
          <AvoidancePreferences
            selected={preferences.foodsToAvoid}
            onChange={(items) => onChange({ ...preferences, foodsToAvoid: items })}
          />
        </div>
      </PreferencesSection>

      <PreferencesSection 
        value="atmosphere" 
        title="Atmosphere Preferences"
        selectedCount={preferences.atmospherePreferences.length}
      >
        <div className="pt-2">
          <AtmospherePreferences
            selected={preferences.atmospherePreferences}
            onChange={(atmospheres) => onChange({ ...preferences, atmospherePreferences: atmospheres })}
          />
        </div>
      </PreferencesSection>
    </Accordion>
  );
};

export default PreferencesForm;