import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    console.log('Processing image URL:', imageUrl);

    // Get credentials from environment
    const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
    
    // Fetch image data
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageData = await imageResponse.arrayBuffer();

    // Convert ArrayBuffer to base64
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageData)));

    // Prepare request to Google Cloud Vision API
    const visionRequest = {
      requests: [{
        image: {
          content: base64Image
        },
        features: [
          {
            type: 'TEXT_DETECTION',
            maxResults: 1
          },
          {
            type: 'DOCUMENT_TEXT_DETECTION',
            maxResults: 1
          }
        ]
      }]
    };

    // Call Vision API directly
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${credentials.private_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visionRequest)
      }
    );

    if (!visionResponse.ok) {
      const error = await visionResponse.text();
      console.error('Vision API error:', error);
      throw new Error(`Vision API error: ${visionResponse.statusText}`);
    }

    const visionResult = await visionResponse.json();
    console.log('Vision API response:', JSON.stringify(visionResult, null, 2));

    // Get text from both detection types
    const textDetection = visionResult.responses[0].textAnnotations?.[0]?.description || '';
    const documentText = visionResult.responses[0].fullTextAnnotation?.text || '';

    // Use document text if available, otherwise fall back to regular text detection
    const combinedText = documentText || textDetection;
    
    // Check if this looks like a menu
    const isLikelyMenu = checkIfLikelyMenu(combinedText);
    if (!isLikelyMenu) {
      console.log('Image does not appear to be a menu');
      return new Response(JSON.stringify({ 
        menuSections: [],
        isMenu: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse menu sections
    const menuSections = parseMenuText(combinedText);
    console.log('Parsed menu sections:', menuSections);

    return new Response(JSON.stringify({
      menuSections,
      isMenu: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing menu:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function checkIfLikelyMenu(text: string): boolean {
  // Common menu indicators
  const menuIndicators = [
    /menu/i,
    /price/i,
    /\$\d+(\.\d{2})?/,
    /appetizer/i,
    /entr[ée]e/i,
    /dessert/i,
    /special/i,
    /dinner/i,
    /lunch/i,
    /breakfast/i
  ];

  // Count how many indicators are present
  const indicatorCount = menuIndicators.reduce((count, indicator) => {
    return count + (indicator.test(text) ? 1 : 0);
  }, 0);

  // If we find at least 2 indicators, consider it a menu
  return indicatorCount >= 2;
}

function parseMenuText(text: string): any[] {
  console.log('Parsing menu text:', text.substring(0, 100) + '...');

  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  const sections: any[] = [];
  let currentSection: any = null;
  let currentItems: any[] = [];

  // Regular expressions for better pattern matching
  const pricePattern = /\$\d+(\.\d{2})?/;
  const sectionHeaderPattern = /^[A-Z\s&]+$/;

  lines.forEach((line) => {
    // Check if line might be a section header
    if (sectionHeaderPattern.test(line) && line.length > 3) {
      // Save previous section if it exists
      if (currentSection && currentItems.length > 0) {
        sections.push({
          name: currentSection,
          items: currentItems
        });
      }
      currentSection = line.trim();
      currentItems = [];
      return;
    }

    // Try to parse item with price
    const priceMatch = line.match(pricePattern);
    if (priceMatch && currentSection) {
      const price = priceMatch[0];
      const name = line.replace(price, '').trim();
      
      if (name) {
        currentItems.push({
          name,
          price: price,
          description: '',
          category: currentSection
        });
      }
    }
  });

  // Add the last section
  if (currentSection && currentItems.length > 0) {
    sections.push({
      name: currentSection,
      items: currentItems
    });
  }

  return sections;
}