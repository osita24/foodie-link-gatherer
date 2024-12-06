import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImageAnnotatorClient } from "https://esm.sh/@google-cloud/vision@4.0.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Google Cloud Vision client
const vision = new ImageAnnotatorClient({
  credentials: JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}'),
});

interface MenuSection {
  name: string;
  items: {
    name: string;
    price?: string;
    description?: string;
  }[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    console.log('Processing image URL:', imageUrl);

    // Perform OCR on the image
    const [result] = await vision.textDetection(imageUrl);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      console.log('No text detected in image');
      return new Response(
        JSON.stringify({ error: 'No text detected in image' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract the full text
    const fullText = detections[0].description;
    console.log('Extracted text:', fullText);

    // Process the text into menu sections
    const menuSections = processMenuText(fullText);
    console.log('Processed menu sections:', menuSections);

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

function processMenuText(text: string): MenuSection[] {
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  const sections: MenuSection[] = [];
  let currentSection: MenuSection | null = null;

  for (const line of lines) {
    // Check if line looks like a section header (all caps, or ends with ':')
    if (line === line.toUpperCase() || line.endsWith(':')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        name: line.replace(':', '').trim(),
        items: []
      };
      continue;
    }

    // If we have a current section, try to parse menu items
    if (currentSection) {
      // Look for price patterns (e.g., $12.99)
      const priceMatch = line.match(/\$?\d+\.?\d*/);
      
      if (priceMatch) {
        const price = priceMatch[0];
        const name = line.substring(0, priceMatch.index).trim();
        const description = line.substring(priceMatch.index + price.length).trim();
        
        currentSection.items.push({
          name,
          price,
          description: description || undefined
        });
      } else {
        // If no price found, treat as item name or description
        const lastItem = currentSection.items[currentSection.items.length - 1];
        if (lastItem && !lastItem.description) {
          lastItem.description = line;
        } else {
          currentSection.items.push({ name: line });
        }
      }
    }
  }

  // Don't forget to add the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}