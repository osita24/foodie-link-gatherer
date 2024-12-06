import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    console.log('Processing image URL:', imageUrl);

    // Initialize Google Cloud Vision API request
    const visionApiEndpoint = 'https://vision.googleapis.com/v1/images:annotate';
    const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
    
    console.log('Sending request to Google Vision API');
    const requestBody = {
      requests: [{
        image: {
          source: {
            imageUri: imageUrl
          }
        },
        features: [{
          type: 'TEXT_DETECTION'
        }]
      }]
    };

    const response = await fetch(`${visionApiEndpoint}?key=${credentials.api_key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    console.log('Vision API response status:', response.status);
    
    if (!result.responses?.[0]?.textAnnotations?.[0]) {
      console.log('No text detected in image');
      return new Response(
        JSON.stringify({ menuSections: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the full text
    const fullText = result.responses[0].textAnnotations[0].description;
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

function processMenuText(text: string) {
  console.log('Processing text into menu sections');
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log('Split into lines:', lines);
  
  const sections = [];
  let currentSection = null;

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
      console.log('Found new section:', currentSection.name);
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
        console.log('Added menu item:', { name, price, description });
      } else {
        // If no price found, treat as item name or description
        const lastItem = currentSection.items[currentSection.items.length - 1];
        if (lastItem && !lastItem.description) {
          lastItem.description = line;
          console.log('Added description to last item:', line);
        } else {
          currentSection.items.push({ name: line });
          console.log('Added item without price:', line);
        }
      }
    }
  }

  // Don't forget to add the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  console.log('Final processed sections:', sections);
  return sections;
}