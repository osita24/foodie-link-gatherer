export async function cleanMenuText(text: string): Promise<string[]> {
  console.log('🧹 Starting text cleanup, original length:', text.length);
  
  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    // Limit text length to avoid token limit issues
    const maxLength = 16000;
    const truncatedText = text.slice(0, maxLength);
    console.log('📝 Truncated text length:', truncatedText.length);

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
            content: `You are a menu item extractor. Extract menu items from the provided text and format them consistently.
            Rules:
            - Each item should be on a new line
            - Include the full item name and any key ingredients or description
            - Remove prices and other non-essential information
            - Ensure items are complete and make sense
            - Format should be consistent: "Item Name - Brief Description"
            - If an item doesn't have a description, skip it
            - Remove any duplicate items
            - Remove any items that don't seem to be actual menu items
            - Minimum 5 words per item including description
            
            Example output:
            Margherita Pizza - Fresh mozzarella, basil, and tomato sauce on hand-tossed dough
            Caesar Salad - Crisp romaine, house-made dressing, parmesan, and garlic croutons
            Grilled Salmon - Fresh Atlantic salmon with seasonal vegetables and lemon butter sauce`
          },
          { role: 'user', content: truncatedText }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await openAIResponse.json();
    const cleanedText = data.choices[0].message.content;
    
    // Split into array and filter out any empty lines or invalid items
    const menuItems = cleanedText
      .split('\n')
      .map(item => item.trim())
      .filter(item => {
        // Ensure item has both name and description
        const hasNameAndDescription = item.includes('-') && 
          item.split('-').length === 2 &&
          item.split('-')[0].trim().length > 0 &&
          item.split('-')[1].trim().length > 0;
        
        // Ensure minimum word count
        const wordCount = item.split(' ').length;
        
        return hasNameAndDescription && wordCount >= 5;
      });

    console.log('✨ Extracted valid menu items:', menuItems.length);
    return menuItems;

  } catch (error) {
    console.error('❌ Error cleaning menu text:', error);
    throw error;
  }
}