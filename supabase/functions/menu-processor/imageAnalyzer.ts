// Keywords that suggest an image is likely a menu
const MENU_IMAGE_KEYWORDS = [
  'menu', 'price list', 'dishes', 'specials', 'cuisine',
  'appetizers', 'entrees', 'mains', 'desserts', 'beverages',
  'food list', 'daily specials', 'chef specials', 'menu board',
  'price board', 'wine list', 'drink menu'
];

export async function analyzeImage(imageUrl: string) {
  try {
    console.log('Analyzing image:', imageUrl);
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get('GOOGLE_PLACES_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'TEXT_DETECTION', maxResults: 1 },
              { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
            ]
          }]
        })
      }
    );

    const data = await visionResponse.json();
    console.log('Vision API response:', data);
    
    const labels = data.responses[0]?.labelAnnotations || [];
    const textAnnotations = data.responses[0]?.textAnnotations || [];
    const fullText = textAnnotations[0]?.description || '';
    
    // Check if it's a menu image
    const isMenu = labels.some((label: any) => 
      MENU_IMAGE_KEYWORDS.some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    );

    // If it's a menu, return the extracted text
    if (isMenu) {
      console.log('Menu image detected, extracted text:', fullText);
      return { type: 'menu', text: fullText };
    }

    // If it's a food image, get descriptive labels
    const foodLabels = labels
      .filter((label: any) => label.score > 0.7)
      .map((label: any) => label.description)
      .join(', ');

    console.log('Food image detected, labels:', foodLabels);
    return { type: 'food', text: foodLabels };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}