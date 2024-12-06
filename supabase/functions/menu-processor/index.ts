import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Common menu-related keywords to help identify menu images
const MENU_IMAGE_KEYWORDS = [
  'menu', 'food', 'dish', 'plate', 'meal', 'cuisine',
  'appetizer', 'entree', 'dessert', 'drink', 'beverage'
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
            content: `You are a menu text processor. Extract only the food and drink items from the given text. 
            Format each item on a new line. Remove prices, descriptions, and any non-menu content. 
            If an item seems incomplete or unclear, try to make it more coherent.
            Only return the list of items, nothing else.`
          },
          { role: 'user', content: text }
        ],
      }),
    });

    const data = await openAIResponse.json();
    const cleanedText = data.choices[0].message.content;
    return cleanedText.split('\n').filter(item => item.trim().length > 0);
  } catch (error) {
    console.error('Error cleaning up menu text:', error);
    return [];
  }
}

async function isLikelyMenuImage(imageUrl: string): Promise<boolean> {
  try {
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
              { type: 'TEXT_DETECTION', maxResults: 1 }
            ]
          }]
        })
      }
    );

    const data = await visionResponse.json();
    
    // Check labels for menu-related keywords
    const labels = data.responses[0]?.labelAnnotations || [];
    const hasMenuLabels = labels.some((label: any) => 
      MENU_IMAGE_KEYWORDS.some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    );

    // Check if there's significant text content
    const hasText = data.responses[0]?.textAnnotations?.length > 0;
    
    return hasMenuLabels || hasText;
  } catch (error) {
    console.error('Error checking if image is menu:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photos = [] } = await req.json();
    console.log('📸 Processing photos:', photos.length);

    if (!photos.length) {
      console.log('⚠️ No photos provided');
      return new Response(
        JSON.stringify({ error: 'No photos provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let allMenuItems: string[] = [];
    
    for (const photoUrl of photos) {
      console.log('🔍 Processing photo:', photoUrl);
      
      try {
        // Check if the image is likely to be a menu
        const isMenuImage = await isLikelyMenuImage(photoUrl);
        
        if (isMenuImage) {
          console.log('✅ Image appears to be menu-related');
          
          const visionResponse = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get('GOOGLE_PLACES_API_KEY')}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                requests: [{
                  image: { source: { imageUri: photoUrl } },
                  features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
                }]
              })
            }
          );

          const data = await visionResponse.json();
          
          if (data.responses?.[0]?.textAnnotations?.[0]?.description) {
            const extractedText = data.responses[0].textAnnotations[0].description;
            console.log('📝 Extracted text:', extractedText);
            
            // Clean up the extracted text using AI
            const cleanedItems = await cleanupMenuText(extractedText);
            allMenuItems = [...allMenuItems, ...cleanedItems];
          }
        } else {
          console.log('⚠️ Image does not appear to be menu-related');
        }
      } catch (error) {
        console.error('❌ Error processing photo:', error);
        continue;
      }
    }

    // Remove duplicates and empty items
    const uniqueItems = [...new Set(allMenuItems)].filter(item => item.trim());
    
    // Format into a single menu section
    const menuSection = {
      name: "Menu Items",
      items: uniqueItems.map((name, index) => ({
        id: `menu-item-${index}`,
        name
      }))
    };

    console.log('✅ Processed all photos, found items:', menuSection.items.length);

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