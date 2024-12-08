import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // For now, return a simple menu structure
    const menuData = {
      menuSections: [
        {
          name: "Main Menu",
          items: [
            {
              id: "item-1",
              name: "House Burger",
              description: "Premium beef patty with lettuce, tomato, and special sauce",
              price: 15.99,
              category: "Main Menu"
            },
            {
              id: "item-2",
              name: "Grilled Chicken Sandwich",
              description: "Marinated chicken breast with avocado and chipotle mayo",
              price: 14.99,
              category: "Main Menu"
            },
            {
              id: "item-3",
              name: "Caesar Salad",
              description: "Fresh romaine, parmesan, croutons with house-made dressing",
              price: 12.99,
              category: "Main Menu"
            }
          ]
        }
      ]
    };

    console.log("Returning menu data with items:", menuData.menuSections[0].items.length);
    
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