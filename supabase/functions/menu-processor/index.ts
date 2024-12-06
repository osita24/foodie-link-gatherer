import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { analyzeImage } from "./imageAnalyzer.ts";
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
    const { photos = [], reviews = [] } = await req.json();
    console.log('📸 Processing photos:', photos.length);
    console.log('📝 Processing reviews:', reviews.length);

    let menuItems: string[] = [];
    
    // Process all images
    for (const photoUrl of photos) {
      try {
        const analysis = await analyzeImage(photoUrl);
        console.log('Image analysis result:', analysis);
        
        // Clean up the text with AI
        const cleanedItems = await cleanMenuText(analysis.text);
        menuItems = [...menuItems, ...cleanedItems];
      } catch (error) {
        console.error('❌ Error processing photo:', error);
        continue;
      }
    }

    // If we didn't find enough menu items from images, try extracting from reviews
    if (menuItems.length < 5 && reviews.length > 0) {
      console.log('🔍 Looking for menu items in reviews...');
      const reviewTexts = reviews
        .map((review: any) => review.text)
        .join('\n');
      
      const menuItemsFromReviews = await cleanMenuText(reviewTexts);
      menuItems = [...new Set([...menuItems, ...menuItemsFromReviews])];
    }

    // Remove duplicates
    const uniqueItems = [...new Set(menuItems)].filter(item => item.trim());
    
    // Format into a menu section
    const menuSection = {
      name: "Menu Items",
      items: uniqueItems.map((name, index) => ({
        id: `menu-item-${index}`,
        name: name.trim()
      }))
    };

    console.log('✅ Final menu items:', menuSection.items);

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