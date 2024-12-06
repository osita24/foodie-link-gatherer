import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    console.log('Processing image URL:', imageUrl);

    // Initialize Google Cloud Vision API request
    const visionApiEndpoint = 'https://vision.googleapis.com/v1/images:annotate';
    const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
    
    const requestBody = {
      requests: [{
        image: {
          source: {
            imageUri: imageUrl
          }
        },
        features: [
          {
            type: 'TEXT_DETECTION',
            model: 'builtin/latest'
          },
          {
            type: 'DOCUMENT_TEXT_DETECTION',
            model: 'builtin/latest'
          }
        ]
      }]
    };

    const response = await fetch(`${visionApiEndpoint}?key=${credentials.api_key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    console.log('Vision API response received');
    
    if (!result.responses?.[0]?.textAnnotations?.[0]) {
      console.log('No text detected in image');
      return new Response(
        JSON.stringify({ menuSections: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the full text
    const fullText = result.responses[0].textAnnotations[0].description;
    console.log('Extracted text length:', fullText.length);

    // Process the text into menu sections
    const menuSections = processMenuText(fullText);

    return new Response(
      JSON.stringify({ menuSections }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing menu:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function processMenuText(text: string) {
  // Split text into lines and clean them
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  
  const sections = [];
  let currentSection = null;
  let currentItem = null;

  // Common price patterns
  const pricePattern = /[\$€£]\s*\d+\.?\d*/;
  
  // Common menu section headers
  const sectionHeaders = [
    'APPETIZERS', 'STARTERS', 'MAIN', 'ENTREES', 'DESSERTS', 
    'DRINKS', 'BEVERAGES', 'SIDES', 'SALADS', 'SOUPS'
  ];

  for (const line of lines) {
    // Check if line is a section header
    const isHeader = sectionHeaders.some(header => 
      line.toUpperCase().includes(header)) || 
      line === line.toUpperCase();

    if (isHeader) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        name: line.trim(),
        items: []
      };
      currentItem = null;
      continue;
    }

    // If we don't have a section yet, create a default one
    if (!currentSection) {
      currentSection = {
        name: 'Menu Items',
        items: []
      };
    }

    // Look for price in the line
    const priceMatch = line.match(pricePattern);
    
    if (priceMatch) {
      const price = priceMatch[0];
      const name = line.substring(0, priceMatch.index).trim();
      const description = line.substring(priceMatch.index + price.length).trim();
      
      currentItem = {
        id: `${currentSection.name}-${currentSection.items.length}`,
        name: name || 'Unnamed Item',
        description: description,
        price: parseFloat(price.replace(/[\$€£\s]/g, ''))
      };
      
      currentSection.items.push(currentItem);
    } else if (currentItem) {
      // If no price found and we have a current item, treat as additional description
      currentItem.description = currentItem.description 
        ? `${currentItem.description} ${line}`
        : line;
    } else {
      // If no price and no current item, might be a new item name
      currentItem = {
        id: `${currentSection.name}-${currentSection.items.length}`,
        name: line,
        description: '',
        price: 0
      };
      currentSection.items.push(currentItem);
    }
  }

  // Don't forget to add the last section
  if (currentSection && currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}