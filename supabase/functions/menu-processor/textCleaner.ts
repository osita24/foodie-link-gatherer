export async function cleanMenuText(text: string): Promise<string[]> {
  console.log('🧹 Cleaning up menu text with AI, text length:', text.length);
  
  try {
    const rawKey = Deno.env.get('OPENAI_API_KEY');
    if (!rawKey) {
      console.error('❌ OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    // Clean up the key by removing any "Api key:" prefix if present
    const openAIKey = rawKey.replace(/^Api key:/, '').trim();
    console.log('🔑 Using OpenAI API key (first 4 chars):', openAIKey.substring(0, 4));

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a menu text processor. Extract and format food and drink items from the given text.
            Rules:
            - Return ONLY dish names, one per line
            - Remove all prices, descriptions, and promotional text
            - Make dish names clear and consistent
            - Group similar items together
            - If text describes food (like from image labels), convert it into likely menu items
            - Ensure items are properly capitalized and formatted
            - If the text is clearly not menu related, return an empty list
            Example output:
            Margherita Pizza
            Pepperoni Pizza
            Caesar Salad`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await openAIResponse.json();
    console.log('🤖 AI cleanup complete');

    if (!data.choices?.[0]?.message?.content) {
      console.error('❌ Unexpected API response format:', data);
      return [];
    }

    const cleanedText = data.choices[0].message.content;
    const menuItems = cleanedText.split('\n').filter(item => item.trim().length > 0);
    console.log(`✨ Extracted ${menuItems.length} menu items:`, menuItems);
    return menuItems;
  } catch (error) {
    console.error('❌ Error cleaning up menu text:', error);
    throw error;
  }
}