import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { cleanMenuText } from "./textCleaner.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photos = [], reviews = [], menuUrl = null } = await req.json();
    console.log('🔍 Processing request:', { 
      photosCount: photos.length, 
      reviewsCount: reviews.length,
      menuUrl 
    });

    let menuText = '';

    // If menu URL is provided, try to fetch its content first
    if (menuUrl) {
      try {
        console.log('📄 Fetching menu from URL:', menuUrl);
        const response = await fetch(menuUrl);
        if (!response.ok) throw new Error(`Failed to fetch menu: ${response.status}`);
        menuText = await response.text();
        console.log('📝 Menu text fetched, length:', menuText.length);
      } catch (error) {
        console.error('❌ Error fetching menu:', error);
      }
    }

    // If no menu text from URL, try extracting from reviews
    if (!menuText && reviews.length > 0) {
      console.log('🔍 Looking for menu items in reviews...');
      const reviewTexts = reviews
        .map((review: any) => review.text)
        .join('\n');
      menuText = reviewTexts;
    }

    // Clean and format the menu text
    const cleanedItems = await cleanMenuText(menuText);
    console.log(`✨ Extracted ${cleanedItems.length} menu items`);

    // Format into a menu section
    const menuSection = {
      name: "Menu Items",
      items: cleanedItems.map((name, index) => ({
        id: `menu-item-${index}`,
        name: name.trim(),
        description: "", // Can be enhanced later with AI
        price: 0 // Can be enhanced later with price extraction
      }))
    };

    return new Response(
      JSON.stringify({ menuSections: [menuSection] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error processing menu:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});