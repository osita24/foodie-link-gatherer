import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

// Common words that indicate menu sections
const MENU_SECTION_INDICATORS = [
  'APPETIZERS', 'STARTERS', 'ENTREES', 'MAIN DISHES', 'DESSERTS',
  'BEVERAGES', 'SIDES', 'SALADS', 'SOUPS', 'PASTA', 'PIZZA',
  'BREAKFAST', 'LUNCH', 'DINNER', 'SPECIALS'
];

// Words that likely indicate non-menu content
const NON_MENU_WORDS = [
  'HOURS', 'CONTACT', 'PHONE', 'ADDRESS', 'FOLLOW', 'WEBSITE',
  'OPEN', 'CLOSED', 'DELIVERY', 'PARKING', 'WIFI', 'EXCELLENCE',
  'DAYS', 'WEEK', 'CALL', 'VISIT', 'LOCATION'
];

function isLikelyMenuSection(text: string): boolean {
  const upperText = text.toUpperCase();
  return MENU_SECTION_INDICATORS.some(indicator => upperText.includes(indicator));
}

function isLikelyMenuItem(text: string): boolean {
  // Remove common non-menu indicators
  if (NON_MENU_WORDS.some(word => text.toUpperCase().includes(word))) {
    return false;
  }

  // Menu items typically have 2-10 words and don't start with numbers
  const words = text.split(' ');
  return words.length >= 2 && 
         words.length <= 10 && 
         !text.match(/^\d/) &&
         !text.match(/^[^a-zA-Z]*$/);
}

function processTextIntoMenuSections(text: string): any[] {
  console.log('Processing text into menu sections:', text);
  
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let currentSection = 'Menu Items';
  const sections: any[] = [];
  let currentItems: string[] = [];

  lines.forEach(line => {
    if (isLikelyMenuSection(line)) {
      // If we have items in the current section, save them
      if (currentItems.length > 0) {
        sections.push({
          name: currentSection,
          items: currentItems.map((item, index) => ({
            id: `${currentSection}-${index}`,
            name: item,
            description: '',
            price: 0
          }))
        });
      }
      currentSection = line.trim();
      currentItems = [];
    } else if (isLikelyMenuItem(line)) {
      currentItems.push(line.trim());
    }
  });

  // Add the last section
  if (currentItems.length > 0) {
    sections.push({
      name: currentSection,
      items: currentItems.map((item, index) => ({
        id: `${currentSection}-${index}`,
        name: item,
        description: '',
        price: 0
      }))
    });
  }

  console.log('Processed sections:', sections);
  return sections;
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    const menuSections: any[] = [];
    
    for (const photoUrl of photos) {
      console.log('🔍 Processing photo:', photoUrl);
      
      try {
        const visionResponse = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_PLACES_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
            })
          }
        );

        if (!visionResponse.ok) {
          console.error('❌ Vision API error:', await visionResponse.text());
          continue;
        }

        const data = await visionResponse.json();
        console.log('✅ Received Vision API response');

        if (data.responses?.[0]?.textAnnotations?.[0]?.description) {
          const text = data.responses[0].textAnnotations[0].description;
          console.log('📝 Extracted text:', text);

          const sections = processTextIntoMenuSections(text);
          menuSections.push(...sections);
        }
      } catch (error) {
        console.error('❌ Error processing photo:', error);
        continue;
      }
    }

    // Remove duplicate sections and merge their items
    const mergedSections = menuSections.reduce((acc: any[], section: any) => {
      const existingSection = acc.find(s => s.name === section.name);
      if (existingSection) {
        existingSection.items.push(...section.items);
      } else {
        acc.push(section);
      }
      return acc;
    }, []);

    console.log('✅ Processed all photos, found sections:', mergedSections.length);

    return new Response(
      JSON.stringify({ menuSections: mergedSections }),
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