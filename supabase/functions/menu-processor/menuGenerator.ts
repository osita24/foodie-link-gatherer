export async function generateMenuItems(existingItems: string[], reviews: any[]): Promise<string[]> {
  console.log('🤖 Starting menu item generation');
  
  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    // Extract relevant food-related content from reviews
    const reviewText = reviews
      .map(review => {
        const text = review.text || '';
        // Only include sentences that likely mention food items
        return text.split('.')
          .filter(sentence => 
            sentence.toLowerCase().includes('ordered') ||
            sentence.toLowerCase().includes('tried') ||
            sentence.toLowerCase().includes('ate') ||
            sentence.toLowerCase().includes('food') ||
            sentence.toLowerCase().includes('dish') ||
            sentence.toLowerCase().includes('menu')
          )
          .join('. ');
      })
      .join('\n');

    const prompt = `Based on these food-focused review excerpts, generate a list of 8-10 actual menu items that are likely served at this restaurant. Focus only on specific dishes, not ambiance or service.

Reviews:
${reviewText}

Format each item as:
[Dish Name] - [Brief description of ingredients and preparation]

Rules:
- Only include actual food/drink items
- No general descriptions or atmosphere
- Must be specific dishes
- Include price range if mentioned in reviews
- Focus on most mentioned dishes
- Keep descriptions focused on ingredients and preparation`;

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
            content: 'You are a restaurant menu expert. Generate only specific food and drink items with their descriptions. Do not include general restaurant features or atmosphere descriptions.'
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
        // Only keep items that follow the [Name] - [Description] format
        const hasValidFormat = item.includes('-');
        // Filter out items that seem to be about atmosphere or general features
        const isNotAtmosphere = !item.toLowerCase().includes('atmosphere') &&
                              !item.toLowerCase().includes('dining') &&
                              !item.toLowerCase().includes('seating') &&
                              !item.toLowerCase().includes('service');
        return hasValidFormat && isNotAtmosphere;
      });

    console.log('✨ Generated menu items:', menuItems.length);
    return menuItems;

  } catch (error) {
    console.error('❌ Error generating menu items:', error);
    return [];
  }
}
