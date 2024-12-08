import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { List, Loader2 } from "lucide-react";
import { MenuCategory } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MenuItem from "./menu/MenuItem";
import MenuHeader from "./menu/MenuHeader";
import MatchScoreCard from "./MatchScoreCard";
import { useRestaurantMatch } from "@/hooks/useRestaurantMatch";

interface MenuSectionProps {
  menu?: MenuCategory[];
  photos?: string[];
  reviews?: any[];
  menuUrl?: string;
}

const MenuSection = ({ menu, photos, reviews, menuUrl }: MenuSectionProps) => {
  const [processedMenu, setProcessedMenu] = useState<MenuCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const { categories } = useRestaurantMatch(null);

  useEffect(() => {
    if (menu) {
      console.log("Using provided menu data:", menu);
      setProcessedMenu(menu);
    } else if (menuUrl || photos?.length || reviews?.length) {
      console.log("Processing available data:", {
        menuUrl: menuUrl || 'none',
        photos: photos?.length || 0,
        reviews: reviews?.length || 0
      });
      processRestaurantData();
    } else {
      console.log("No data available to process");
    }
  }, [menu, photos, reviews, menuUrl]);

  const processLet's enhance the menu recommendations to be more personalized and user-friendly. First, we need to update the menu processor edge function to provide better analysis.

<lov-code>
First, let's update the menu processor edge function:

<lov-write file_path="supabase/functions/menu-processor/menuAnalyzer.ts">
import { UserPreferences } from "../../../src/types/preferences";

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: UserPreferences,
  openAIKey: string
): Promise<{
  score: number;
  reason?: string;
  warning?: string;
  tag?: string;
}> {
  try {
    console.log('🔍 Analyzing menu item:', item.name);
    
    const prompt = `
    Analyze this menu item and the user's preferences to provide a personalized recommendation.
    
    Menu Item:
    Name: ${item.name}
    Description: ${item.description || 'No description available'}
    
    User Preferences:
    - Favorite Cuisines: ${preferences.cuisinePreferences?.join(', ') || 'None specified'}
    - Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None specified'}
    - Favorite Proteins: ${preferences.favoriteProteins?.join(', ') || 'None specified'}
    - Foods to Avoid: ${preferences.foodsToAvoid?.join(', ') || 'None specified'}
    - Spice Level (1-5): ${preferences.spiceLevel || 'Not specified'}
    
    Provide a JSON response with:
    1. A match score (0-100)
    2. A tag (one of: "Perfect Match!", "Try Something New", "Good Choice", "Heads Up", "Not Recommended")
    3. A SHORT, specific reason if it's a great match (score >= 85) focusing on user preferences (e.g. "Contains your favorite protein: chicken")
    4. A SHORT, specific warning if there are concerns (score <= 40) (e.g. "Contains shellfish (your allergen)")
    
    Keep messages under 50 characters, mobile-friendly.
    Focus on the most relevant match/concern.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a culinary expert that provides concise, personalized dish recommendations.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 150
      }),
    });

    const data = await response.json();
    console.log('✨ AI Analysis response:', data);

    try {
      const result = JSON.parse(data.choices[0].message.content);
      return {
        score: result.score,
        tag: result.tag,
        reason: result.score >= 85 ? result.reason : undefined,
        warning: result.score <= 40 ? result.warning : undefined
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return { score: 50, tag: "Good Choice" };
    }
  } catch (error) {
    console.error('Error analyzing menu item:', error);
    return { score: 50, tag: "Good Choice" };
  }
}