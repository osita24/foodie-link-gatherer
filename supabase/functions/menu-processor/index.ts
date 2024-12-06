import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VisionRequest {
  requests: {
    image: {
      source: {
        imageUri: string;
      };
    };
    features: {
      type: string;
      maxResults: number;
    }[];
  }[];
}

serve(async (req) => {
  // Handle CORS preflight
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

    const GOOGLE_CLOUD_CREDENTIALS = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
    if (!GOOGLE_CLOUD_CREDENTIALS.client_email || !GOOGLE_CLOUD_CREDENTIALS.private_key) {
      console.error('❌ Missing Google Cloud credentials');
      throw new Error('Google Cloud credentials not configured');
    }

    const menuSections: any[] = [];
    
    for (const photoUrl of photos) {
      console.log('🔍 Processing photo:', photoUrl);
      
      const visionRequest: VisionRequest = {
        requests: [{
          image: {
            source: {
              imageUri: photoUrl
            }
          },
          features: [{
            type: 'TEXT_DETECTION',
            maxResults: 1
          }]
        }]
      };

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get('GOOGLE_PLACES_API_KEY')}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(visionRequest)
        }
      );

      if (!response.ok) {
        console.error('❌ Vision API error:', await response.text());
        continue;
      }

      const data = await response.json();
      console.log('✅ Received Vision API response');

      if (data.responses?.[0]?.textAnnotations?.[0]?.description) {
        const text = data.responses[0].textAnnotations[0].description;
        console.log('📝 Extracted text:', text);

        // Basic text processing to identify menu items
        const lines = text.split('\n');
        let currentSection = '';
        let items: any[] = [];

        for (const line of lines) {
          // Skip empty lines and common non-menu text
          if (!line.trim() || /^(phone|address|hours|www|http|follow|like)/i.test(line)) {
            continue;
          }

          // If line is in all caps and followed by menu items, treat as section
          if (line === line.toUpperCase() && line.length > 3) {
            if (currentSection && items.length) {
              menuSections.push({
                name: currentSection,
                items: items.map((item, index) => ({
                  id: `${currentSection}-${index}`,
                  name: item,
                  description: '',
                }))
              });
            }
            currentSection = line;
            items = [];
          } else {
            // Remove prices and common symbols
            const cleanedItem = line.replace(/\$\d+(\.\d{2})?/g, '').replace(/[•★]/g, '').trim();
            if (cleanedItem) {
              items.push(cleanedItem);
            }
          }
        }

        // Add the last section
        if (currentSection && items.length) {
          menuSections.push({
            name: currentSection,
            items: items.map((item, index) => ({
              id: `${currentSection}-${index}`,
              name: item,
              description: '',
            }))
          });
        }
      }
    }

    console.log('✅ Processed all photos, found sections:', menuSections.length);

    // If no menu sections were found, create a default one
    if (menuSections.length === 0) {
      menuSections.push({
        name: 'Menu Items',
        items: []
      });
    }

    return new Response(
      JSON.stringify({ menuSections }),
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