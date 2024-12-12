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
    console.log('🎯 Generate match message function called');
    const { matchType, score, itemDetails } = await req.json();
    
    // Quick validation to fail fast if data is missing
    if (!matchType || score === undefined) {
      console.error('❌ Missing required parameters');
      throw new Error('Missing required parameters');
    }

    console.log('📊 Processing match:', { matchType, score });

    // Generate a simple message without AI for better performance
    let message = '';
    
    switch (matchType) {
      case 'perfect':
        message = score >= 95 ? 'Perfect choice! ⭐' : 'Great match! ✨';
        break;
      case 'good':
        message = 'Good pick! 👍';
        break;
      case 'warning':
        if (itemDetails?.dietaryInfo?.length) {
          message = 'Dietary warning ⚠️';
        } else {
          message = 'May not match ⚠️';
        }
        break;
      default:
        message = 'Neutral match 🤔';
    }

    console.log('✅ Generated message:', message);

    return new Response(
      JSON.stringify({ message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('❌ Error in generate-match-message:', error);
    
    // Return a safe fallback message instead of failing
    return new Response(
      JSON.stringify({ 
        message: 'Match status ℹ️'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 // Return 200 even on error to prevent client issues
      }
    );
  }
});