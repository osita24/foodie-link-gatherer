import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  console.log('🎯 Function called:', req.method);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { matchType, score, itemDetails } = await req.json();
    
    console.log('📊 Processing match data:', { matchType, score, itemDetails });

    // Validate required parameters
    if (!matchType || typeof score !== 'number') {
      throw new Error('Invalid parameters');
    }

    // Handle 0% matches first
    if (score === 0) {
      const message = itemDetails?.dietaryInfo?.length 
        ? 'Does not match dietary preferences ⚠️'
        : 'Not recommended ⚠️';
      
      console.log('⚠️ Zero match score:', message);
      return new Response(
        JSON.stringify({ message }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );
    }

    // Generate message for non-zero scores
    let message = '';
    if (score >= 90) {
      message = 'Perfect match! ⭐';
    } else if (score >= 70) {
      message = 'Great choice! ✨';
    } else if (score >= 50) {
      message = 'Good option 👍';
    } else if (matchType === 'warning') {
      message = 'Check details ⚠️';
    } else {
      message = 'May not match preferences 🤔';
    }

    console.log('✅ Generated message:', message);

    return new Response(
      JSON.stringify({ message }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Always return a valid response
    return new Response(
      JSON.stringify({ 
        message: 'Menu item ℹ️',
        error: error.message 
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 // Return 200 to prevent client-side errors
      }
    );
  }
});