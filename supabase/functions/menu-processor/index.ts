import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeMenuData } from "./geminiUtils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photos, reviews, menuUrl } = await req.json();
    console.log("📥 Received request with:", { 
      photoCount: photos?.length, 
      reviewCount: reviews?.length,
      menuUrl 
    });

    if (!photos?.length && !reviews?.length && !menuUrl) {
      throw new Error("No data provided for menu generation");
    }

    const menuItems = await analyzeMenuData(photos, reviews, menuUrl);

    // Format response to match expected structure
    const response = {
      menuSections: [{
        name: "Menu",
        items: menuItems.map((item: any) => ({
          id: crypto.randomUUID(),
          ...item
        }))
      }]
    };

    console.log("📤 Sending response with menu items:", response);
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("❌ Error processing menu:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});