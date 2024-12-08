import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, item, preferences, menuUrl, photos, reviews } = await req.json();
    console.log('Request payload:', { action, menuUrl, photos, reviews });

    // Handle menu item analysis
    if (action === 'analyze-item') {
      console.log('Analyzing menu item:', item);
      console.log('User preferences:', preferences);

      const itemText = `${item.name} ${item.description || ''}`.toLowerCase();
      let score = 75; // Default score
      const reasons: string[] = [];
      const warnings: string[] = [];

      // Check favorite proteins (highest priority)
      if (preferences.favorite_proteins) {
        for (const protein of preferences.favorite_proteins) {
          if (itemText.includes(protein.toLowerCase())) {
            score += 20;
            reasons.push(`Contains ${protein} (your favorite protein)`);
          }
        }
      }

      // Check dietary restrictions (highest negative priority)
      if (preferences.dietary_restrictions) {
        for (const restriction of preferences.dietary_restrictions) {
          if (itemText.includes(restriction.toLowerCase())) {
            score -= 40;
            warnings.push(`Contains ${restriction} (dietary restriction)`);
          }
        }
      }

      // Normalize score
      score = Math.min(Math.max(score, 0), 100);

      const response = {
        score,
        allReasons: score >= 85 ? reasons : [],
        allWarnings: score <= 40 ? warnings : [],
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle menu processing
    console.log('Processing menu data');
    
    // For testing, return a sample menu structure
    const sampleMenu: MenuCategory[] = [{
      name: "Main Menu",
      items: [
        {
          id: "1",
          name: "Grilled Chicken Breast",
          description: "Tender chicken breast with herbs",
          category: "Mains"
        },
        {
          id: "2",
          name: "Vegetable Stir Fry",
          description: "Fresh vegetables in garlic sauce",
          category: "Mains"
        }
      ]
    }];

    return new Response(
      JSON.stringify({ menuSections: sampleMenu }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in menu-processor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});