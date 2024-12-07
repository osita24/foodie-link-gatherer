import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeMenuData(photos: string[], reviews: string[], menuUrl?: string) {
  console.log("🤖 Starting Gemini menu analysis");
  
  try {
    const apiKey = Deno.env.get('GOOGLE_AI_KEY');
    if (!apiKey) {
      throw new Error("GOOGLE_AI_KEY is not configured");
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    let contextPrompt = "Based on the following restaurant data, generate a structured menu:\n";
    
    if (menuUrl) {
      contextPrompt += `Restaurant website: ${menuUrl}\n`;
    }
    
    if (reviews?.length) {
      contextPrompt += `Reviews mentioning food items:\n${reviews.slice(0, 5).join('\n')}\n`;
    }
    
    if (photos?.length) {
      contextPrompt += `${photos.length} photos are available for analysis.\n`;
    }
    
    const prompt = `${contextPrompt}
    Please generate a menu with common dishes from this restaurant.
    Format the response as a JSON array of menu items, where each item has:
    - name (string)
    - description (string)
    - price (number, estimated if not found)
    - category (string, e.g., "Appetizers", "Main Course", etc.)
    
    Focus on commonly mentioned dishes and typical prices for this type of restaurant.`;

    console.log("🔍 Sending prompt to Gemini");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Received response from Gemini");
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not extract menu data from response");
    }
    
    const menuData = JSON.parse(jsonMatch[0]);
    console.log("📋 Extracted menu data:", menuData);
    
    return menuData;
    
  } catch (error) {
    console.error("❌ Error in Gemini analysis:", error);
    throw error;
  }
}