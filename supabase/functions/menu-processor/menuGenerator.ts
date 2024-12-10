export async function generateMenuItems(existingItems: string[], reviews: any[]): Promise<string[]> {
  console.log('🤖 Starting menu item generation');
  
  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    // Extract cuisine types and context from reviews (increased from 5 to 10 reviews)
    const limitedReviews = reviews?.slice(0, 10) || [];
    const reviewText = limitedReviews.map(review => review.text || '').join('\n');

    const prompt = `Based on these reviews and any existing menu items, generate a comprehensive list of likely menu items for this restaurant. Include popular dishes mentioned in reviews and typical dishes for this cuisine type.

Reviews:
${reviewText}

Existing Items:
${existingItems.join('\n')}

Format each item as:
Dish Name - Description

Generate 15-20 unique items that are likely to be on the menu, focusing on:
- Dishes specifically mentioned in reviews
- Popular items for this type of cuisine
- Both main courses and appetizers
- Special dietary options (vegetarian, gluten-free, etc.)
- Signature dishes
- Seasonal specialties`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a restaurant menu expert. Generate menu items in the format "Item Name - Description". Each item must have a proper description. Make descriptions detailed and appetizing. Focus on accuracy and variety.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
    
    // Remove duplicates by comparing normalized item names
    const uniqueItems = Array.from(new Set(menuItems.map(item => {
      const normalizedName = item.split('-')[0].trim().toLowerCase();
      return { normalizedName, fullItem: item };
    })))
    .map(item => item.fullItem);

    console.log('✨ After removing duplicates:', uniqueItems.length);
    return uniqueItems;

  } catch (error) {
    console.error('❌ Error generating menu items:', error);
    return [];
  }
}