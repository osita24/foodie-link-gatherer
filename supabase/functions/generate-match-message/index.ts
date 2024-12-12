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
    console.log('📥 Received request to generate match message');
    const { matchType, score, itemDetails, preferences } = await req.json();
    
    console.log('🔍 Processing request with:', { matchType, score });
    
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log('🤖 Generating match message');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a concise AI food recommender. Generate a very short message (max 25 characters) about how well a menu item matches user preferences. 
            Focus on the most important single reason why it matches or doesn't match.
            Include one emoji at the end.
            
            Examples:
            - "Contains dairy 🚫"
            - "Vegan friendly ✅"
            - "Too spicy 🌶️"
            - "Perfect match! 🎯"`
          },
          {
            role: 'user',
            content: `Generate a very short match message for a menu item with:
            Match type: ${matchType}
            Score: ${score}
            Item details: ${JSON.stringify(itemDetails)}
            User preferences: ${JSON.stringify(preferences)}
            
            The message should be extremely concise, focusing on just one key reason.`
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      
      // Return a fallback response instead of throwing
      return new Response(
        JSON.stringify({ 
          message: matchType === 'warning' ? 'Not suitable ⚠️' : 'Good match ✅',
          error: errorText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Still return 200 since we're providing a fallback
        }
      );
    }

    const data = await response.json();
    const message = data.choices[0].message.content.trim();

    console.log('✨ Generated message:', message);

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in generate-match-message function:', error);
    
    // Return a fallback response with error details
    return new Response(
      JSON.stringify({ 
        message: matchType === 'warning' ? 'Not suitable ⚠️' : 'Good match ✅',
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 since we're providing a fallback
      }
    );
  }
});