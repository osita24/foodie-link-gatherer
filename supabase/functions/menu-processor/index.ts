import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Keywords that suggest an image is likely a menu
const MENU_IMAGE_KEYWORDS = [
  'menu', 'price list', 'dishes', 'specials', 'cuisine',
  'appetizers', 'entrees', 'mains', 'desserts', 'beverages',
  'food list', 'daily specials', 'chef specials'
];

async function cleanupMenuText(text: string): Promise<string[]> {
  console.log('Cleaning up menu text with AI:', text);
  
  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a menu text processor. Extract ONLY the food and drink items from the given text.
            Rules:
            - Return ONLY dish names, one per line
            - Remove all prices and descriptions
            - Remove any non-menu content (hours, contact info, etc.)
            - Make dish names clear and consistent
            - If a dish seems incomplete or unclear, make it more coherent
            - Focus on actual menu items, ignore promotional text
            Example output:
            Margherita Pizza
            Chicken Alfredo
            Caesar Salad`
          },
          { role: 'user', content: text }
        ],
      }),
    });

    const data = await openAIResponse.json();
    console.log('AI cleanup response:', data);
    const cleanedText = data.choices[0].message.content;
    return cleanedText.split('\n').filter(item => item.trim().length > 0);
  } catch (error) {
    console.error('Error cleaning up menu text:', error);
    return [];
  }
}

async function isMenuImage(imageUrl: string): Promise<boolean> {
  try {
    console.log('Analyzing image:', imageUrl);
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get('GOOGLE_PLACES_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'TEXT_DETECTION', maxResults: 1 },
              { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
            ]
          }]
        })
      }
    );

    const data = await visionResponse.json();
    console.log('Vision API response:', data);
    
    // Check for menu-related labels
    const labels = data.responses[0]?.labelAnnotations || [];
    const hasMenuLabels = labels.some((label: any) => 
      MENU_IMAGE_KEYWORDS.some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    );

    // Check if there's significant text content that might indicate a menu
    const textAnnotations = data.responses[0]?.textAnnotations || [];
    const fullText = textAnnotations[0]?.description || '';
    const hasMenuText = MENU_IMAGE_KEYWORDS.some(keyword => 
      fullText.toLowerCase().includes(keyword)
    );

    // Check for structured text layout typical of menus
    const hasStructuredText = fullText.includes('$') || 
                             /\d+\.\d{2}/.test(fullText) ||
                             fullText.toLowerCase().includes('price');

    console.log('Image analysis results:', {
      hasMenuLabels,
      hasMenuText,
      hasStructuredText
    });

    return hasMenuLabels || (hasMenuText && hasStructuredText);
  } catch (error) {
    console.error('Error analyzing image:', error);
    return false;
  }
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
    
    // First, try to find and process menu images
    for (const photoUrl of photos) {
      try {
        const isLikelyMenu = await isMenuImage(photoUrl);
        
        if (isLikelyMenu) {
          console.log('✅ Found likely menu image:', photoUrl);
          
          const visionResponse = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get('GOOGLE_PLACES_API_KEY')}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                requests: [{
                  image: { source: { imageUri: photoUrl } },
                  features: [
                    { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
                  ]
                }]
              })
            }
          );

          const data = await visionResponse.json();
          
          if (data.responses?.[0]?.fullTextAnnotation?.text) {
            const extractedText = data.responses[0].fullTextAnnotation.text;
            console.log('📝 Extracted text from menu image:', extractedText);
            
            // Clean up the extracted text using AI
            const cleanedItems = await cleanupMenuText(extractedText);
            menuItems = [...menuItems, ...cleanedItems];
          }
        }
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
      
      const menuItemsFromReviews = await cleanupMenuText(reviewTexts);
      menuItems = [...new Set([...menuItems, ...menuItemsFromReviews])];
    }

    // Remove duplicates and empty items
    const uniqueItems = [...new Set(menuItems)].filter(item => 
      item.trim() && 
      !item.includes('$') && 
      !item.toLowerCase().includes('contact') &&
      !item.toLowerCase().includes('hour') &&
      !item.toLowerCase().includes('open')
    );
    
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