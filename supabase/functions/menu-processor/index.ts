import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { analyzeImage } from "./imageAnalyzer.ts";
import { cleanMenuText } from "./textCleaner.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photos = [], reviews = [] } = await req.json();
    console.log('📸 Processing photos:', photos.length);
    console.log('📝 Processing reviews:', reviews.length);

    // Initialize menu items array
    let menuItems: string[] = [];
    let processedPhotos = 0;

    // If we have photos, process them first
    if (photos?.length > 0) {
      for (const photoUrl of photos) {
        try {
          processedPhotos++;
          console.log(`\n🖼️ Processing photo ${processedPhotos}/${photos.length}: ${photoUrl}`);
          
          const analysis = await analyzeImage(photoUrl);
          console.log(`📊 Image analysis result:`, analysis);
          
          if (analysis.text) {
            const cleanedItems = await cleanMenuText(analysis.text);
            console.log('✨ Cleaned menu items:', cleanedItems);
            menuItems = [...menuItems, ...cleanedItems];
          }
        } catch (error) {
          console.error('❌ Error processing photo:', error);
          // Continue with next photo instead of failing completely
          continue;
        }
      }
    }

    // If we have reviews and not enough menu items, process reviews
    if ((menuItems.length < 5 || !photos?.length) && reviews?.length > 0) {
      console.log('🔍 Looking for menu items in reviews...');
      const reviewTexts = reviews
        .map((review: any) => review.text || '')
        .filter(Boolean)
        .join('\n');
      
      if (reviewTexts.trim()) {
        const menuItemsFromReviews = await cleanMenuText(reviewTexts);
        console.log('📝 Menu items found in reviews:', menuItemsFromReviews);
        menuItems = [...new Set([...menuItems, ...menuItemsFromReviews])];
      }
    }

    // If we still don't have any menu items, return a default structure
    if (menuItems.length === 0) {
      console.log('⚠️ No menu items found, returning default structure');
      return new Response(
        JSON.stringify({
          menuSections: [{
            name: "Menu Items",
            items: [{
              id: "default-1",
              name: "Menu information not available",
              description: "We're working on getting the latest menu information."
            }]
          }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove duplicates and empty items
    const uniqueItems = [...new Set(menuItems)]
      .filter(item => item.trim())
      .map((name, index) => ({
        id: `menu-item-${index}`,
        name: name.trim(),
        // Optionally add a price for some items
        price: Math.random() > 0.7 ? Number((Math.random() * 20 + 5).toFixed(2)) : undefined
      }));

    const menuSection = {
      name: "Menu Items",
      items: uniqueItems
    };

    console.log(`✅ Final menu items count: ${menuSection.items.length}`);

    return new Response(
      JSON.stringify({ 
        menuSections: [menuSection],
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in menu processor:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        menuSections: [{
          name: "Menu Items",
          items: [{
            id: "error-1",
            name: "Unable to load menu",
            description: "We encountered an error while loading the menu. Please try again later."
          }]
        }]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});