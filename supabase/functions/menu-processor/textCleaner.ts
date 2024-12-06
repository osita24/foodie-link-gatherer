export async function cleanMenuText(text: string): Promise<string[]> {
  console.log('Cleaning up menu text with AI:', text);
  
  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
            Example output:
            Margherita Pizza
            Pepperoni Pizza
            Caesar Salad`
          },
          { role: 'user', content: text }
        ],
      }),
    });

    const data = await openAIResponse.json();
    console.log('AI cleanup response:', data);
    const cleanedText = data.choices[0].message.content;
    return cleanedText.split('\n').filter(item => item.trim().length > 0);
  } catch (error) {
    console.error('Error cleaning up menu text:', error);
    return [];
  }
}