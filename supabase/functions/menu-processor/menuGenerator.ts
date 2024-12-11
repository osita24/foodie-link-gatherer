export async function generateMenuItems(existingItems: string[], reviews: any[]): Promise<string[]> {
  console.log('🤖 Starting menu item generation');
  
  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    // Extract cuisine types and context from reviews (limited to 5 reviews)
    const reviewText = reviews.map(review => review.text || '').join('\n');

    const prompt = `Based on these reviews, generate a list of 8-10 likely menu items for this restaurant. Include popular dishes mentioned in reviews.

Reviews:
${reviewText}

Format each item as:
Dish Name - Brief Description

Focus on:
- Most mentioned dishes in reviews
- Popular items
- Keep descriptions concise`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Using a faster model
        messages: [
          {
            role: 'system',
            content: 'You are a restaurant menu expert. Generate menu items in the format "Item Name - Description". Keep descriptions brief but informative.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000 // Reduced token limit
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await openAIResponse.json();
    const generatedText = data.choices[0].message.content;
    
    // Split into array and filter out any empty lines or invalid items
    const menuItems = generatedText
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.includes('-'));

    console.log('✨ Generated menu items:', menuItems.length);
    return menuItems;

  } catch (error) {
    console.error('❌ Error generating menu items:', error);
    return [];
  }
}