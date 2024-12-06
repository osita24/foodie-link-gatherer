import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { vision } from "https://esm.sh/@google-cloud/vision@4.0.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photos } = await req.json();
    console.log('Processing restaurant photos:', { photoCount: photos?.length || 0 });

    if (!photos || photos.length === 0) {
      throw new Error('No photos provided for analysis');
    }

    // Initialize Vision client
    const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
    const client = new vision.ImageAnnotatorClient({ credentials });

    // Process all photos
    console.log('Starting photo analysis...');
    const menuItems = new Set();
    
    for (const photoUrl of photos) {
      try {
        console.log('Analyzing photo:', photoUrl);
        const [result] = await client.textDetection(photoUrl);
        const detections = result.textAnnotations;
        
        if (detections && detections.length > 0) {
          const fullText = detections[0].description;
          console.log('Detected text:', fullText);
          
          // Split text into lines and process each line
          const lines = fullText.split('\n');
          for (const line of lines) {
            // Basic filtering for likely menu items
            // Avoid prices, single words, and common non-menu text
            if (line.length > 5 && 
                !line.match(/^\$?\d+(\.\d{2})?$/) && // Skip pure price lines
                !line.match(/^(menu|specials|appetizers|entrees|desserts)$/i) && // Skip section headers
                line.trim().split(' ').length > 1) { // Skip single words
              menuItems.add(line.trim());
            }
          }
        }
      } catch (error) {
        console.error('Error processing photo:', error);
        // Continue with next photo
      }
    }

    // Convert menu items to structured format
    const menuItemsArray = Array.from(menuItems);
    console.log('Extracted menu items:', menuItemsArray);

    // Group items into basic categories
    const menuSections = [
      {
        name: "Featured Items",
        items: menuItemsArray.map((name, index) => ({
          id: `item-${index}`,
          name,
          description: "",
          price: 0
        }))
      }
    ];

    console.log('Generated menu sections:', menuSections);

    return new Response(
      JSON.stringify({ menuSections }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing restaurant data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});