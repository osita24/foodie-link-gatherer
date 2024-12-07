export async function cleanMenuText(text: string): Promise<string[]> {
  console.log('🧹 Cleaning up menu text with AI, text length:', text.length);
  
  try {
    const rawKey = Deno.env.get('OPENAI_API_KEY');
    if (!rawKey) {
      console.error('❌ OpenAI API key is not configured');
      return fallbackTextProcessing(text);
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
      return fallbackTextProcessing(text);
    }

    const data = await openAIResponse.json();
    console.log('🤖 AI cleanup complete');

    if (!data.choices?.[0]?.message?.content) {
      console.error('❌ Unexpected API response format:', data);
      return fallbackTextProcessing(text);
    }

    const cleanedText = data.choices[0].message.content;
    const menuItems = cleanedText.split('\n').filter(item => item.trim().length > 0);
    console.log(`✨ Extracted ${menuItems.length} menu items:`, menuItems);
    return menuItems;
  } catch (error) {
    console.error('❌ Error cleaning up menu text:', error);
    return fallbackTextProcessing(text);
  }
}

// Simple fallback text processing when OpenAI is unavailable
function fallbackTextProcessing(text: string): string[] {
  console.log('⚠️ Using fallback text processing');
  
  // Split text into lines
  const lines = text.split(/[\n\r]+/);
  
  // Basic processing rules
  const menuItems = lines
    .map(line => line.trim())
    .filter(line => {
      // Remove empty lines and very short text
      if (line.length < 3) return false;
      
      // Remove lines that are likely prices or just numbers
      if (/^\$?\d+(\.\d{2})?$/.test(line)) return false;
      
      // Remove common non-menu text
      const nonMenuWords = ['hours', 'open', 'close', 'phone', 'address', 'website'];
      if (nonMenuWords.some(word => line.toLowerCase().includes(word))) return false;
      
      return true;
    })
    .map(line => {
      // Capitalize first letter of each word
      return line.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    });

  // Remove duplicates
  const uniqueItems = [...new Set(menuItems)];
  
  console.log('⚠️ Fallback processing found items:', uniqueItems.length);
  return uniqueItems;
}