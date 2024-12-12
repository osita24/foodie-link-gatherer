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

    const { matchType, score, itemDetails, preferences } = await req.json();
    
    console.log('📊 Processing match data:', { matchType, score, itemDetails, preferences });

    // Validate required parameters
    if (!matchType || typeof score !== 'number') {
      throw new Error('Invalid parameters');
    }

    // Handle 0% matches first
    if (score === 0) {
      let message = '';
      
      // Check if it's due to dietary restrictions
      if (itemDetails?.dietaryInfo?.length) {
        const restrictions = preferences?.dietary_restrictions || [];
        if (restrictions.includes('Vegetarian')) {
          message = 'Contains meat - not suitable for vegetarians ⚠️';
        } else if (restrictions.includes('Vegan')) {
          message = 'Contains animal products - not suitable for vegans ⚠️';
        } else if (restrictions.includes('Gluten-Free')) {
          message = 'Contains gluten - not suitable for gluten-free diet ⚠️';
        } else {
          message = `Doesn't align with your dietary preferences ⚠️`;
        }
      } else if (preferences?.foods_to_avoid?.some((food: string) => 
        itemDetails?.name?.toLowerCase().includes(food.toLowerCase()) || 
        itemDetails?.description?.toLowerCase().includes(food.toLowerCase())
      )) {
        message = 'Contains ingredients you prefer to avoid ⚠️';
      } else {
        message = 'Not recommended based on your preferences ⚠️';
      }
      
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
      message = 'Perfect match with your preferences! ⭐';
    } else if (score >= 70) {
      message = 'Great choice that aligns with your taste! ✨';
    } else if (score >= 50) {
      message = 'Decent option that partially matches your preferences 👍';
    } else if (matchType === 'warning') {
      message = 'Consider other options that better match your preferences ⚠️';
    } else {
      message = 'May not align well with your dining preferences 🤔';
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