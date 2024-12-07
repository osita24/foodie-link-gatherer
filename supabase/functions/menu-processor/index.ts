import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { cleanMenuText } from "./textCleaner.ts";
import { generateMenuItems } from "./menuGenerator.ts";

console.log("Menu processor function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    console.log("Processing request");
    const { menuUrl, photos, reviews } = await req.json();
    console.log("Input data:", { menuUrl, photosCount: photos?.length, reviewsCount: reviews?.length });

    let menuItems: string[] = [];

    // Try to extract menu items from reviews first
    if (reviews?.length) {
      console.log("Extracting menu items from reviews");
      const reviewText = reviews.map((review: any) => review.text).join('\n');
      const extractedItems = await cleanMenuText(reviewText);
      menuItems = [...menuItems, ...extractedItems];
    }

    // Generate additional menu items based on existing items and reviews
    if (reviews?.length) {
      console.log("Generating additional menu items");
      const generatedItems = await generateMenuItems(menuItems, reviews);
      menuItems = [...menuItems, ...generatedItems];
    }

    // If we still don't have menu items, generate some based on the restaurant type
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

    // Transform the items into the expected format
    const formattedItems = menuItems.map((item, index) => {
      const [name, description] = item.split(' - ');
      return {
        id: `item-${index + 1}`,
        name: name.trim(),
        description: description?.trim() || '',
        category: 'Main Menu'
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
        status: 200,
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
        status: 500,
      },
    );
  }
});