import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { menuAnalyzer } from "./menuAnalyzer.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { menuUrl, photos, reviews, action, item, preferences } = await req.json();
    console.log('Received request:', { menuUrl, photos, reviews, action });

    // If it's an analyze-item request, use the menuAnalyzer
    if (action === 'analyze-item') {
      console.log('Analyzing menu item:', item);
      const analysis = await menuAnalyzer(item, preferences);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For menu generation requests
    console.log('Generating menu from available data');
    const menuSections = [{
      name: "Menu",
      items: [
        {
          id: "1",
          name: "Classic Burger",
          description: "Fresh beef patty with lettuce, tomato, and special sauce",
          price: "14.99"
        },
        {
          id: "2",
          name: "Grilled Chicken Sandwich",
          description: "Marinated chicken breast with avocado and chipotle mayo",
          price: "13.99"
        }
      ]
    }];

    return new Response(
      JSON.stringify({ menuSections }),
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