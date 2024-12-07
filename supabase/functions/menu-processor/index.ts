import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { cleanMenuText } from "./textCleaner.ts";
import { scanForMenuUrls } from "./urlScanner.ts";
import { generateMenuItems } from "./menuGenerator.ts";

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
    let additionalMenuUrls: string[] = [];

    // If menu URL is provided, try to fetch its content and scan for additional menu URLs
    if (menuUrl) {
      try {
        console.log('📄 Fetching menu from URL:', menuUrl);
        const response = await fetch(menuUrl);
        if (!response.ok) throw new Error(`Failed to fetch menu: ${response.status}`);
        const fullText = await response.text();
        // Take only first 16000 characters to avoid token limits
        menuText = fullText.slice(0, 16000);
        console.log('📝 Menu text fetched, length:', menuText.length);

        // Scan for additional menu URLs
        const baseUrl = new URL(menuUrl).origin;
        additionalMenuUrls = await scanForMenuUrls(menuText, baseUrl);
        console.log('🔍 Found additional menu URLs:', additionalMenuUrls);

        // Fetch content from additional URLs (limit to first 2 URLs)
        for (const url of additionalMenuUrls.slice(0, 2)) {
          try {
            console.log('📄 Fetching additional menu from:', url);
            const additionalResponse = await fetch(url);
            if (additionalResponse.ok) {
              const additionalText = await additionalResponse.text();
              // Add only first 8000 characters from each additional URL
              menuText += '\n' + additionalText.slice(0, 8000);
            }
          } catch (error) {
            console.error('⚠️ Error fetching additional menu:', error);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching menu:', error);
      }
    }

    // Extract menu items from reviews (limit to first 5 reviews)
    if (reviews.length > 0) {
      console.log('🔍 Looking for menu items in reviews...');
      const limitedReviews = reviews.slice(0, 5);
      const reviewTexts = limitedReviews
        .map((review: any) => review.text)
        .join('\n');
      menuText += '\n' + reviewTexts;
    }

    // Clean and format the menu text
    const cleanedItems = await cleanMenuText(menuText);
    console.log(`✨ Extracted ${cleanedItems.length} menu items from content`);

    // Generate additional menu items based on cuisine type and context
    const generatedItems = await generateMenuItems(cleanedItems, reviews);
    console.log(`✨ Generated ${generatedItems.length} additional menu items`);

    // Combine and deduplicate items
    const allItems = [...new Set([...cleanedItems, ...generatedItems])];
    console.log(`✨ Total unique menu items: ${allItems.length}`);

    // Format into a menu section
    const menuSection = {
      name: "Menu Items",
      items: allItems.map((name, index) => ({
        id: `menu-item-${index}`,
        name: name.trim(),
        description: "", // Can be enhanced later with AI
        price: 0, // Can be enhanced later with price extraction
        category: "" // Can be enhanced later with category extraction
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