import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { analyzeMenuItem } from "./menuAnalyzer.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, item, preferences, restaurant } = await req.json();
    const openAIKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (action === 'analyze-item') {
      console.log('🔍 Analyzing menu item:', item.name);
      const analysis = await analyzeMenuItem(item, preferences, restaurant, openAIKey);
      
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action specified');
  } catch (error) {
    console.error('Error in menu-processor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});