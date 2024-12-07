import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { processMenuData } from "./menuGenerator.ts";

console.log("Menu processor function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    console.log("Processing request");
    const { menuUrl, photos, reviews } = await req.json();
    console.log("Input data:", { menuUrl, photosCount: photos?.length, reviewsCount: reviews?.length });

    const menuData = await processMenuData({ menuUrl, photos, reviews });
    console.log("Menu data processed successfully");

    return new Response(
      JSON.stringify(menuData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error processing menu:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    );
  }
});