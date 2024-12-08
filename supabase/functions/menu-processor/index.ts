import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { analyzeMenuItem } from "./menuAnalyzer.ts";

console.log("Menu processor function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, item, preferences, menuUrl, photos, reviews } = await req.json();
    console.log("Received request with action:", action);

    if (action === 'analyze-item') {
      console.log("Analyzing menu item:", item);
      if (!item || !preferences) {
        throw new Error("Missing required parameters for item analysis");
      }
      const result = await analyzeMenuItem(item, preferences);
      console.log("Analysis result:", result);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Default menu processing logic
    console.log("Processing menu data with:", { menuUrl, photos, reviews });
    const menuSections = [{
      name: "Menu",
      items: [
        {
          id: "1",
          name: "Sample Item",
          description: "This is a sample menu item",
          price: 10.99,
          category: "Main Course"
        }
      ]
    }];

    return new Response(
      JSON.stringify({ menuSections }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in menu processor:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred processing the menu" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});