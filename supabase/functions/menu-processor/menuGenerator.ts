export async function generateMenuItems(existingItems: string[], reviews: any[]): Promise<string[]> {
  console.log('🤖 Starting menu item generation');
  
  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    // Limit the number of existing items to avoid token limits
    const limitedItems = existingItems.slice(0, 20);
    
    // Extract cuisine types and context from reviews (limit to first 5 reviews)
    const limitedReviews = reviews.slice(0, 5);
    const reviewText = limitedReviews.map(review => review.text).join('\n');

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
            content: `You are a restaurant menu expert. Based on the existing menu items and reviews, 
            generate additional likely menu items that would fit this restaurant's style and cuisine.
            Rules:
            - Generate items in the format: "Item Name - Detailed Description"
            - Each item must have a proper description
            - Ensure items fit the restaurant's cuisine type and style
            - Make descriptions detailed and appetizing
            - Include key ingredients and preparation methods
            - Minimum 5 words per item including description
            - Generate no more than 10 additional items
            - Do not duplicate existing items
            - If you can't confidently generate items, return an empty list`
          },
          {
            role: 'user',
            content: `Existing menu items:\n${limitedItems.join('\n')}\n\nReviews:\n${reviewText}`
          }
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
    const generatedText = data.choices[0].message.content;
    
    // Filter and validate generated items
    const generatedItems = generatedText
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
        
        // Ensure item is not a duplicate
        const isDuplicate = existingItems.some(existing => 
          existing.toLowerCase().includes(item.split('-')[0].trim().toLowerCase())
        );
        
        return hasNameAndDescription && wordCount >= 5 && !isDuplicate;
      });

    console.log('✨ Generated valid menu items:', generatedItems.length);
    return generatedItems;

  } catch (error) {
    console.error('❌ Error generating menu items:', error);
    return [];
  }
}