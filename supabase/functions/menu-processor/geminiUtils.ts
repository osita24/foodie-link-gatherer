import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeMenuData(photos: string[], reviews: string[], menuUrl?: string) {
  console.log("🤖 Starting Gemini menu analysis");
  
  try {
    const apiKey = Deno.env.get('GOOGLE_AI_KEY');
    if (!apiKey) {
      console.error("❌ GOOGLE_AI_KEY is not configured in Supabase secrets");
      throw new Error("GOOGLE_AI_KEY is not configured");
    }
    
    console.log("✅ Found API key, initializing Gemini");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    let contextPrompt = "Based on the following restaurant data, generate a structured menu:\n\n";
    
    if (menuUrl) {
      contextPrompt += `Restaurant website: ${menuUrl}\n\n`;
    }
    
    if (reviews?.length) {
      contextPrompt += `Customer reviews mentioning food:\n${reviews.slice(0, 5).join('\n')}\n\n`;
    }
    
    if (photos?.length) {
      contextPrompt += `${photos.length} photos are available for analysis.\n\n`;
    }
    
    const prompt = `${contextPrompt}
    Generate a menu with common dishes from this restaurant.
    Format the response as a JSON array of menu items, where each item has:
    - name (string, required)
    - description (string, optional)
    - price (number, estimated)
    - category (string, e.g., "Appetizers", "Main Course", etc.)
    
    Example format:
    [
      {
        "name": "Classic Burger",
        "description": "Beef patty with lettuce, tomato, and cheese",
        "price": 12.99,
        "category": "Main Course"
      }
    ]`;

    console.log("🔍 Sending prompt to Gemini");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Received response from Gemini:", text);
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("❌ Could not extract menu data from response");
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