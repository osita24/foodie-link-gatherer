import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Menu processor function started");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { menuUrl, photos, reviews, restaurant } = await req.json();
    console.log("📥 Received input data:", { 
      menuUrl,
      photosCount: photos?.length, 
      reviewsCount: reviews?.length,
      restaurant: restaurant?.name
    });

    // Initialize OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Combine all available data for analysis
    const analysisContent = {
      restaurantName: restaurant?.name || '',
      cuisine: restaurant?.types?.join(', ') || '',
      reviews: reviews?.map((r: any) => r.text).join('\n') || '',
      description: `${restaurant?.types?.join(', ')} restaurant`
    };

    console.log("🔍 Analyzing restaurant data:", analysisContent);

    // Use OpenAI to generate menu items based on restaurant data
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a restaurant menu expert. Generate a realistic menu for this restaurant based on its type, reviews, and characteristics. Format each item as:
            {
              "id": "unique-id",
              "name": "Item Name",
              "description": "Detailed description with ingredients",
              "category": "Category Name",
              "dietaryInfo": ["vegetarian", "gluten-free", etc],
              "spiceLevel": 1-5,
              "popular": boolean
            }`
          },
          {
            role: 'user',
            content: `Generate a menu for: ${JSON.stringify(analysisContent, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    console.log("✨ Generated AI response");

    // Parse the AI response and structure the menu
    const menuItems = JSON.parse(
      aiResponse.choices[0].message.content
        .replace(/```json\n?/, '')
        .replace(/```/, '')
    );

    // Group items by category
    const menuByCategory = menuItems.reduce((acc: any, item: any) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // Format the final menu structure
    const menuSections = Object.entries(menuByCategory).map(([category, items]) => ({
      name: category,
      items: items
    }));

    console.log(`✅ Generated menu with ${menuItems.length} items across ${menuSections.length} categories`);

    return new Response(
      JSON.stringify({ menuSections }),
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