import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_KEY') || '');

export async function analyzeMenuData(photos: string[], reviews: string[]) {
  console.log("🤖 Starting Gemini menu analysis");
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Based on the following restaurant data, generate a structured menu:
    ${reviews.length} customer reviews and ${photos.length} photos are available.
    
    Reviews: ${reviews.slice(0, 5).join('\n')}
    
    Please format the response as a JSON array of menu items, where each item has:
    - name (string)
    - description (string, optional)
    - price (number, optional)
    - category (string)
    
    Focus on commonly mentioned dishes and clear pricing information.`;

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