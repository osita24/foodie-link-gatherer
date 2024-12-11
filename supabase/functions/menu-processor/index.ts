import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateMenuItems } from "./menuGenerator.ts";

console.log("Menu processor function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { menuUrl, photos, reviews } = await req.json();
    console.log("📥 Processing request with:", { 
      menuUrl: menuUrl ? "present" : "absent", 
      photosCount: photos?.length, 
      reviewsCount: reviews?.length 
    });

    // Only process a limited number of reviews for faster processing
    const limitedReviews = reviews?.slice(0, 5) || [];
    
    // Generate menu items from reviews
    console.log("🔄 Generating menu items from reviews");
    const menuItems = await generateMenuItems([], limitedReviews);

    if (!menuItems.length) {
      console.log("ℹ️ No menu items generated, using default items");
      const defaultItems = [
        "House Special Roll - Fresh fish and vegetables wrapped in seasoned rice",
        "Teriyaki Chicken - Grilled chicken with house-made sauce",
        "Miso Soup - Traditional Japanese soup with tofu",
        "Vegetable Tempura - Assorted vegetables in crispy batter",
        "Green Tea Ice Cream - Creamy matcha dessert"
      ];
      menuItems.push(...defaultItems);
    }

    const formattedItems = menuItems.slice(0, 10).map((item, index) => {
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
      menuSections: [{
        name: "Main Menu",
        items: formattedItems
      }]
    };

    console.log(`✅ Returning ${formattedItems.length} menu items`);
    
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
    console.error("❌ Error processing menu:", error);
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