import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@google-cloud/vision@4.0.2';

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

    // Initialize Google Cloud Vision client
    const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
    const vision = new createClient({
      credentials,
    });

    // Fetch image data
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const imageData = await response.arrayBuffer();

    // Perform both text detection and document text detection
    const [textResult] = await vision.textDetection({
      image: { content: new Uint8Array(imageData) }
    });
    const [documentResult] = await vision.documentTextDetection({
      image: { content: new Uint8Array(imageData) }
    });

    const textAnnotations = textResult.textAnnotations || [];
    const documentAnnotations = documentResult.fullTextAnnotation?.text || '';

    console.log('Text detection results:', {
      textAnnotations: textAnnotations.length > 0 ? 'Found' : 'None',
      documentText: documentAnnotations ? 'Found' : 'None'
    });

    // Combine and process text
    const combinedText = documentAnnotations || (textAnnotations[0]?.description || '');
    
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