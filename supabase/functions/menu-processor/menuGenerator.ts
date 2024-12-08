export async function generateMenuItems(existingItems: string[], reviews: any[]): Promise<string[]> {
  console.log('🤖 Starting menu item generation');
  
  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    // Extract cuisine types and context from reviews (limit to first 5 reviews)
    const limitedReviews = reviews?.slice(0, 5) || [];
    const reviewText = limitedReviews.map(review => review.text || '').join('\n');

    const prompt = `Generate a list of menu items based on these reviews:\n${reviewText}\n\nFormat each item as:\nDish Name - Description\n\nGenerate 5-10 items.`;

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
            content: 'You are a restaurant menu expert. Generate menu items in the format "Item Name - Description". Each item must have a proper description. Make descriptions detailed and appetizing.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
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
      .filter(item => {
        const hasNameAndDescription = item.includes('-') && 
          item.split('-').length === 2 &&
          item.split('-')[0].trim().length > 0 &&
          item.split('-')[1].trim().length > 0;
        
        const wordCount = item.split(' ').length;
        return hasNameAndDescription && wordCount >= 5;
      });

    console.log('✨ Generated valid menu items:', menuItems.length);
    return menuItems;

  } catch (error) {
    console.error('❌ Error generating menu items:', error);
    return [];
  }
}