import { UserPreferences } from "../../../src/types/preferences";

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: UserPreferences,
  openAIKey: string
): Promise<{
  score: number;
  reason?: string;
  warning?: string;
}> {
  try {
    console.log('🔍 Analyzing menu item:', item.name);
    
    const prompt = `
    Analyze this menu item and the user's preferences to provide a personalized recommendation.
    
    Menu Item:
    Name: ${item.name}
    Description: ${item.description || 'No description available'}
    
    User Preferences:
    - Cuisine Preferences: ${preferences.cuisinePreferences?.join(', ') || 'None specified'}
    - Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None specified'}
    - Favorite Proteins: ${preferences.favoriteProteins?.join(', ') || 'None specified'}
    - Foods to Avoid: ${preferences.foodsToAvoid?.join(', ') || 'None specified'}
    - Spice Level (1-5): ${preferences.spiceLevel || 'Not specified'}
    - Atmosphere Preferences: ${preferences.atmospherePreferences?.join(', ') || 'None specified'}
    - Special Considerations: ${preferences.specialConsiderations || 'None specified'}
    
    Provide a JSON response with:
    1. A match score (0-100)
    2. A SHORT, specific reason if it's a great match (score >= 85) focusing on user preferences
       Examples: "Contains your favorite protein: chicken", "Perfect for your spice level", "Matches your dietary needs"
    3. A SHORT, specific warning if there are concerns (score <= 40)
       Examples: "Contains shellfish (your allergen)", "Very spicy (you prefer mild)", "Contains ingredients you avoid"
    
    Keep messages under 50 characters, mobile-friendly.
    Focus on the most relevant match/concern.`;

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
            content: 'You are a culinary expert that provides concise, personalized dish recommendations based on detailed user preferences.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 150
      }),
    });

    const data = await response.json();
    console.log('✨ AI Analysis response:', data);

    try {
      const result = JSON.parse(data.choices[0].message.content);
      return {
        score: result.score,
        reason: result.score >= 85 ? result.reason : undefined,
        warning: result.score <= 40 ? result.warning : undefined
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return { score: 50 };
    }
  } catch (error) {
    console.error('Error analyzing menu item:', error);
    return { score: 50 };
  }
}