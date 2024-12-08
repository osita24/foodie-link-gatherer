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
    const { menuUrl, photos, reviews } = await req.json();
    console.log("Received input data:", { 
      menuUrl, 
      photosCount: photos?.length, 
      reviewsCount: reviews?.length 
    });

    // Initialize menuItems array
    let menuItems: string[] = [];

    // Process reviews if available
    if (Array.isArray(reviews) && reviews.length > 0) {
      console.log("Processing reviews for menu items");
      const reviewTexts = reviews
        .filter(review => review && typeof review.text === 'string')
        .map(review => review.text);
      
      if (reviewTexts.length > 0) {
        const reviewText = reviewTexts.join('\n');
        const extractedItems = await cleanMenuText(reviewText);
        menuItems = [...menuItems, ...extractedItems];
        console.log(`Extracted ${extractedItems.length} items from reviews`);
      }
    }

    // Generate additional items if needed
    if (reviews?.length) {
      console.log("Generating additional menu items");
      const generatedItems = await generateMenuItems(menuItems, reviews);
      menuItems = [...menuItems, ...generatedItems];
      console.log(`Generated ${generatedItems.length} additional items`);
    }

    // Fallback to default items if no items were found
    if (menuItems.length === 0) {
      console.log("Using default menu items");
      menuItems = [
        "House Burger - Premium beef patty with lettuce, tomato, and special sauce",
        "Grilled Chicken Sandwich - Marinated chicken breast with avocado and chipotle mayo",
        "Caesar Salad - Fresh romaine, parmesan, croutons with house-made dressing",
        "Fish & Chips - Beer-battered cod with crispy fries and tartar sauce",
        "Veggie Bowl - Quinoa, roasted vegetables, and tahini dressing"
      ];
    }

    // Format the menu items
    const formattedItems = menuItems.map((item, index) => {
      const [name, description] = item.split(' - ');
      return {
        id: `item-${index + 1}`,
        name: name.trim(),
        description: description?.trim() || '',
        price: 0, // Default price
        category: 'Main Menu' // Default category
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