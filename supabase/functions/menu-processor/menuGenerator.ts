export async function generateMenuItems(existingItems: string[], reviews: any[]): Promise<string[]> {
  console.log('🤖 Generating additional menu items based on context');
  
  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OpenAI API key is not configured');
      return [];
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
            Focus on accuracy and authenticity. Return only the names of dishes, one per line.
            Rules:
            - Only generate items that are very likely to exist at this restaurant
            - Use the existing items and reviews as context for the restaurant's style
            - Keep the same naming style as the existing items
            - Don't duplicate existing items
            - Generate no more than 10 additional items
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
      return [];
    }

    const data = await openAIResponse.json();
    const generatedText = data.choices[0].message.content;
    const generatedItems = generatedText.split('\n').filter(item => 
      item.trim().length > 0 && !existingItems.includes(item.trim())
    );

    console.log('✨ Generated items:', generatedItems);
    return generatedItems;

  } catch (error) {
    console.error('❌ Error generating menu items:', error);
    return [];
  }
}