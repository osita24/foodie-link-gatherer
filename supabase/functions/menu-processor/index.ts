import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { cleanMenuText } from "./textCleaner.ts";
import { generateMenuItems } from "./menuGenerator.ts";
import { analyzeMenuItem } from "./menuAnalyzer.ts";

console.log("Menu processor function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { action, menuUrl, photos, reviews, item, preferences } = await req.json();
    console.log("Input data:", { action, menuUrl, photosCount: photos?.length, reviewsCount: reviews?.length });

    // Handle analyze-item action
    if (action === 'analyze-item') {
      console.log("Analyzing menu item:", item?.name);
      console.log("User preferences:", preferences);

      if (!item || !preferences) {
        console.log("Missing required data for item analysis");
        return new Response(
          JSON.stringify({ score: 50 }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          },
        );
      }

      const analysis = await analyzeMenuItem(item, preferences, Deno.env.get("OPENAI_API_KEY") || "");
      console.log("Analysis result:", analysis);

      return new Response(
        JSON.stringify(analysis),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Handle menu processing action (default)
    let menuItems: string[] = [];

    if (reviews?.length) {
      console.log("Extracting menu items from reviews");
      const reviewText = reviews.map((review: any) => review.text).join('\n');
      const extractedItems = await cleanMenuText(reviewText);
      menuItems = [...menuItems, ...extractedItems];
    }

    if (menuItems.length === 0) {
      console.log("No menu items found, generating default items");
      const defaultItems = [
        "House Burger - Premium beef patty with lettuce, tomato, and special sauce",
        "Grilled Chicken Sandwich - Marinated chicken breast with avocado and chipotle mayo",
        "Caesar Salad - Fresh romaine, parmesan, croutons with house-made dressing",
        "Fish & Chips - Beer-battered cod with crispy fries and tartar sauce",
        "Veggie Bowl - Quinoa, roasted vegetables, and tahini dressing"
      ];
      menuItems = defaultItems;
    }

    const formattedItems = menuItems.map((item, index) => {
      const [name, description] = item.split(' - ');
      return {
        id: `item-${index + 1}`,
        name: name.trim(),
        description: description?.trim() || '',
      };
    });

    const menuData = {
      menuSections: [
        {
          name: "Main Menu",
          items: formattedItems
        }
      ]
    };

    console.log(`Returning ${formattedItems.length} menu items`);
    
    return new Response(
      JSON.stringify(menuData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );

  } catch (error) {
    console.error("Error processing menu:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    );
  }
});