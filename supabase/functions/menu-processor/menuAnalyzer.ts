interface Restaurant {
  name: string;
  cuisine?: string;
  priceLevel?: number;
  rating?: number;
  servesVegetarianFood?: boolean;
}

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: any,
  restaurant: Restaurant,
  openAIKey: string
): Promise<{
  score: number;
  reason?: string;
  warning?: string;
}> {
  try {
    console.log('🔍 Analyzing menu item:', item.name, 'for restaurant:', restaurant.name);
    
    const prompt = `
    You are a culinary expert providing personalized dish recommendations.
    Analyze this menu item considering both user preferences and restaurant context.
    
    Restaurant Context:
    Name: ${restaurant.name}
    Cuisine: ${restaurant.cuisine || 'Unknown'}
    Price Level: ${restaurant.priceLevel || 'Unknown'}
    Rating: ${restaurant.rating || 'Unknown'}
    Serves Vegetarian: ${restaurant.servesVegetarianFood ? 'Yes' : 'Unknown'}
    
    Menu Item:
    Name: ${item.name}
    Description: ${item.description || 'No description available'}
    
    User Preferences:
    - Favorite Cuisines: ${preferences.cuisinePreferences?.join(', ') || 'None specified'}
    - Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None specified'}
    - Favorite Proteins: ${preferences.favoriteProteins?.join(', ') || 'None specified'}
    - Foods to Avoid: ${preferences.foodsToAvoid?.join(', ') || 'None specified'}
    - Spice Level (1-5): ${preferences.spiceLevel || 'Not specified'}
    - Atmosphere Preferences: ${preferences.atmospherePreferences?.join(', ') || 'None specified'}
    
    Consider:
    1. Dietary restrictions and allergies (highest priority)
    2. Match with favorite cuisines and proteins
    3. Foods to avoid
    4. Restaurant's specialty and ratings
    5. Price point alignment
    
    Provide a JSON response with:
    1. score: A match score (0-100)
    2. reason: A specific reason if it's a great match (score >= 85)
    3. warning: A specific warning if there are concerns (score <= 40)
    
    Keep messages under 50 characters, mobile-friendly.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a culinary expert specializing in personalized dish recommendations.' },
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