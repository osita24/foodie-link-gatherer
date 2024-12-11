import { corsHeaders } from '../_shared/cors.ts';

interface AnalysisResult {
  score: number;
  reason?: string;
  warning?: string;
  matchType: 'perfect' | 'good' | 'neutral' | 'warning';
}

export async function analyzeMenuItem(
  item: { name: string; description?: string },
  preferences: any
): Promise<AnalysisResult> {
  try {
    console.log('🔍 Analyzing menu item:', item.name);
    
    const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
    let score = 50; // Base score
    let reasons: string[] = [];
    let warnings: string[] = [];
    
    // Check dietary preferences with weighted scoring
    if (preferences.dietary_restrictions?.length > 0) {
      console.log('🥗 Checking dietary restrictions:', preferences.dietary_restrictions);
      
      // Handle vegetarian preferences
      if (preferences.dietary_restrictions.includes("Vegetarian")) {
        const meatKeywords = [
          'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb', 
          'turkey', 'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni', 
          'anchovy', 'duck', 'veal', 'foie gras', 'chorizo', 'sausage'
        ];
        
        const containsMeat = meatKeywords.some(keyword => itemContent.includes(keyword));
        
        if (containsMeat) {
          console.log('❌ Item contains meat, not suitable for vegetarian diet');
          return {
            score: 0,
            warning: "Contains meat - not suitable for vegetarians",
            matchType: 'warning'
          };
        } else {
          // Start with higher base score for vegetarian-compatible items
          score = 60;
          reasons.push("Suitable for vegetarians");
          
          // Additional boost for explicitly vegetarian items
          const vegetarianKeywords = ['vegetarian', 'veggie', 'meatless', 'plant-based'];
          if (vegetarianKeywords.some(keyword => itemContent.includes(keyword))) {
            score += 20;
            reasons[0] = "Perfect for vegetarians";
          }
        }
      }
      
      // Handle vegan preferences with more nuance
      if (preferences.dietary_restrictions.includes("Vegan")) {
        const nonVeganKeywords = [
          'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb',
          'cheese', 'cream', 'milk', 'egg', 'butter', 'honey', 'yogurt',
          'mayo', 'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni',
          'anchovy', 'duck', 'veal', 'foie gras', 'chorizo', 'sausage',
          'gelatin', 'whey', 'casein', 'ghee', 'lard', 'aioli'
        ];
        
        const containsNonVegan = nonVeganKeywords.some(keyword => itemContent.includes(keyword));
        
        // If it's explicitly marked as vegan, give it a high score
        if (itemContent.includes('vegan')) {
          score = 90;
          reasons.push("Certified vegan dish");
        } else if (containsNonVegan) {
          // If user has multiple dietary preferences, don't immediately disqualify
          if (preferences.dietary_restrictions.length > 1) {
            score = Math.max(30, score - 30); // Reduce score but don't zero it
            warnings.push("Contains non-vegan ingredients");
          } else {
            // If vegan is the only restriction, then be strict
            return {
              score: 0,
              warning: "Contains animal products - not suitable for vegans",
              matchType: 'warning'
            };
          }
        } else {
          // Potentially vegan items get a moderate score
          score = Math.max(score, 60);
          reasons.push("May be suitable for vegans - please verify");
        }
      }
      
      // Check gluten-free preferences
      if (preferences.dietary_restrictions.includes("Gluten-Free")) {
        const glutenKeywords = [
          'bread', 'pasta', 'flour', 'wheat', 'tortilla', 'breaded',
          'crusted', 'battered', 'soy sauce', 'teriyaki', 'noodles',
          'ramen', 'udon', 'couscous', 'barley', 'malt', 'seitan', 'panko'
        ];
        
        const containsGluten = glutenKeywords.some(keyword => itemContent.includes(keyword));
        
        if (containsGluten) {
          if (preferences.dietary_restrictions.length > 1) {
            score = Math.max(30, score - 20); // Reduce score but don't zero it
            warnings.push("Contains gluten");
          } else {
            score = 20;
            warnings.push("Contains gluten - not recommended for gluten-free diet");
          }
        } else if (itemContent.includes('gluten-free')) {
          score += 20;
          reasons.push("Certified gluten-free");
        }
      }
    }

    // Check cuisine match
    const cuisineMatches = preferences.cuisine_preferences?.filter(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    );
    
    if (cuisineMatches?.length > 0) {
      score += 15;
      reasons.push(`Authentic ${cuisineMatches[0]} dish`);
    }

    // Check favorite ingredients
    const ingredientMatches = preferences.favorite_ingredients?.filter(
      (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
    );

    if (ingredientMatches?.length > 0) {
      score += 15;
      reasons.push(`Contains ${ingredientMatches[0]}, which you enjoy`);
    }

    // Analyze cooking methods and ingredients
    const healthyIndicators = {
      "grilled": "Healthy grilled preparation",
      "steamed": "Light and healthy steamed preparation",
      "baked": "Oven-baked for a healthier option",
      "fresh": "Made with fresh ingredients",
      "organic": "Features organic ingredients",
      "seasonal": "Made with seasonal ingredients",
      "house-made": "Freshly prepared in-house"
    };

    for (const [indicator, reason] of Object.entries(healthyIndicators)) {
      if (itemContent.includes(indicator)) {
        score += 10;
        reasons.push(reason);
        break;
      }
    }

    // Determine match type based on final score and warnings
    let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
    if (score >= 90 && warnings.length === 0) {
      matchType = 'perfect';
    } else if (score >= 75 && warnings.length === 0) {
      matchType = 'good';
    } else if (warnings.length > 0 || score < 40) {
      matchType = 'warning';
    }

    // Cap score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    console.log('✅ Analysis complete:', { score, matchType, reason: reasons[0], warning: warnings[0] });

    return {
      score,
      reason: reasons[0],
      warning: warnings[0],
      matchType
    };
  } catch (error) {
    console.error('❌ Error analyzing menu item:', error);
    return { 
      score: 50,
      matchType: 'neutral',
      reason: "Standard menu item"
    };
  }
}