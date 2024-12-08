import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateMenuItems } from "./menuGenerator.ts";

console.log("Menu processor function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { menuUrl, photos, reviews } = await req.json();
    console.log("Received input data:", { 
      menuUrl, 
      photosCount: photos?.length, 
      reviewsCount: reviews?.length 
    });

    // Generate menu items from reviews
    const menuItems = await generateMenuItems([], reviews || []);

    if (!menuItems.length) {
      console.log("No menu items generated, using default items");
      menuItems.push(
        "House Special Sushi Roll - Fresh fish and vegetables wrapped in seasoned rice and nori",
        "Teriyaki Chicken - Grilled chicken glazed with house-made teriyaki sauce",
        "Miso Soup - Traditional Japanese soup with tofu and seaweed",
        "Vegetable Tempura - Assorted vegetables in light, crispy batter",
        "Green Tea Ice Cream - Creamy matcha flavored dessert"
      );
    }

    // Format the menu items
    const formattedItems = menuItems.map((item, index) => {
      const [name, description] = item.split(' - ');
      return {
        id: `item-${index + 1}`,
        name: name.trim(),
        description: description?.trim() || '',
        price: 0,
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
      },
    );

  } catch (error) {
    console.error("Error processing menu:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process menu data",
        details: error.message 
      }),
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