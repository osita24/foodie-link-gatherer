// Keywords that suggest an image is likely a menu
const MENU_IMAGE_KEYWORDS = [
  'menu', 'price list', 'dishes', 'specials', 'cuisine',
  'appetizers', 'entrees', 'mains', 'desserts', 'beverages',
  'food list', 'daily specials', 'chef specials', 'menu board',
  'price board', 'wine list', 'drink menu', 'text', 'document',
  'paper', 'list', 'restaurant menu'
];

// Keywords that suggest an image is food
const FOOD_IMAGE_KEYWORDS = [
  'food', 'dish', 'meal', 'plate', 'cuisine',
  'restaurant', 'appetizer', 'entree', 'dessert',
  'breakfast', 'lunch', 'dinner', 'snack'
];

export async function analyzeImage(imageUrl: string) {
  try {
    console.log('🔍 Analyzing image:', imageUrl);
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get('GOOGLE_PLACES_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 15 },
              { type: 'TEXT_DETECTION', maxResults: 1 },
              { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
            ]
          }]
        })
      }
    );

    const data = await visionResponse.json();
    console.log('🤖 Vision API response received');
    
    const labels = data.responses[0]?.labelAnnotations || [];
    const textAnnotations = data.responses[0]?.textAnnotations || [];
    const fullText = textAnnotations[0]?.description || '';
    const objects = data.responses[0]?.localizedObjectAnnotations || [];
    
    // Check if it's a menu image
    const isMenu = labels.some((label: any) => 
      MENU_IMAGE_KEYWORDS.some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    );

    // Check if it's a food image
    const isFood = labels.some((label: any) => 
      FOOD_IMAGE_KEYWORDS.some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    ) || objects.some((obj: any) => obj.name.toLowerCase() === 'food');

    if (isMenu) {
      console.log('📜 Menu image detected, extracted text length:', fullText.length);
      return { 
        type: 'menu', 
        text: fullText,
        confidence: labels.find((l: any) => 
          MENU_IMAGE_KEYWORDS.some(k => l.description.toLowerCase().includes(k))
        )?.score || 0
      };
    }

    if (isFood) {
      // Get descriptive labels for food images
      const foodLabels = labels
        .filter((label: any) => label.score > 0.7)
        .map((label: any) => label.description)
        .join(', ');

      console.log('🍽️ Food image detected, labels:', foodLabels);
      return { 
        type: 'food', 
        text: foodLabels,
        confidence: labels.find((l: any) => 
          FOOD_IMAGE_KEYWORDS.some(k => l.description.toLowerCase().includes(k))
        )?.score || 0
      };
    }

    console.log('❓ Image type not determined');
    return { type: 'unknown', text: '', confidence: 0 };
  } catch (error) {
    console.error('❌ Error analyzing image:', error);
    throw error;
  }
}