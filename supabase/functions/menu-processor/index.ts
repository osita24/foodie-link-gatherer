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
    const { photos, reviews } = await req.json();
    console.log('Processing restaurant data:', { 
      photoCount: photos?.length || 0, 
      reviewCount: reviews?.length || 0 
    });

    // Prepare the prompt for GPT-4
    const prompt = generatePrompt(photos, reviews);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes restaurant photos and reviews to identify menu items and categories.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const menuData = JSON.parse(result.choices[0].message.content);

    console.log('Generated menu data:', menuData);

    return new Response(
      JSON.stringify({ menuSections: menuData }),
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

function generatePrompt(photos: string[], reviews: any[]): string {
  // Combine all available information
  const reviewTexts = reviews?.map(review => review.text).join('\n') || '';
  
  return `Based on the following restaurant information, create a structured menu with categories and items.
  
Number of photos: ${photos?.length || 0}
Reviews: ${reviewTexts}

Please analyze this information and create a menu structure with the following format:
[
  {
    "name": "Category Name",
    "items": [
      {
        "name": "Item Name",
        "description": "Brief description based on reviews/context",
        "price": "Estimated price if mentioned"
      }
    ]
  }
]

Focus on:
1. Popular dishes mentioned in reviews
2. Categories that make sense for this type of restaurant
3. Include descriptions that highlight what customers say
4. If exact prices aren't available, provide reasonable estimates or ranges
5. Group similar items together in logical categories

Please provide the response in valid JSON format only.`;
}