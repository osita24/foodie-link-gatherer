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
    
    // Check dietary preferences
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
          // Boost score for vegetarian-friendly items
          const vegetarianKeywords = ['vegetarian', 'veggie', 'meatless', 'plant-based'];
          if (vegetarianKeywords.some(keyword => itemContent.includes(keyword))) {
            score += 30;
            reasons.push("Perfect for vegetarians");
          }
        }
      }
      
      // Handle vegan preferences
      if (preferences.dietary_restrictions.includes("Vegan")) {
        const nonVeganKeywords = [
          'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb',
          'cheese', 'cream', 'milk', 'egg', 'butter', 'honey', 'yogurt',
          'mayo', 'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni',
          'anchovy', 'duck', 'veal', 'foie gras', 'chorizo', 'sausage',
          'gelatin', 'whey', 'casein', 'ghee', 'lard', 'aioli'
        ];
        
        const containsNonVegan = nonVeganKeywords.some(keyword => itemContent.includes(keyword));
        
        if (containsNonVegan) {
          console.log('❌ Item contains non-vegan ingredients');
          return {
            score: 0,
            warning: "Contains animal products - not suitable for vegans",
            matchType: 'warning'
          };
        } else {
          // Boost score for vegan-friendly items
          const veganKeywords = ['vegan', 'plant-based', 'dairy-free'];
          if (veganKeywords.some(keyword => itemContent.includes(keyword))) {
            score += 30;
            reasons.push("Perfect for vegans");
          }
        }
      }
      
      // Check gluten-free preferences
      if (preferences.dietary_restrictions.includes("Gluten-Free")) {
        const glutenKeywords = [
          'bread', 'pasta', 'flour', 'wheat', 'tortilla', 'breaded',
          'crusted', 'battered', 'soy sauce', 'teriyaki', 'noodles',
          'ramen', 'udon', 'couscous', 'barley', 'malt', 'seitan', 'panko'
        ];
        
        if (glutenKeywords.some(keyword => itemContent.includes(keyword))) {
          score -= 20; // Penalty but not automatic 0
          reasons.push("May contain gluten");
        } else if (itemContent.includes('gluten-free')) {
          score += 20;
          reasons.push("Gluten-free option");
        }
      }
    }

    // Check cuisine match
    const cuisineMatches = preferences.cuisine_preferences?.filter(
      (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
    );
    
    if (cuisineMatches?.length > 0) {
      score += 20;
      reasons.push(`Authentic ${cuisineMatches[0]} dish that matches your taste`);
    }

    // Check favorite proteins
    const proteinMatches = preferences.favorite_proteins?.filter(
      (protein: string) => {
        if (protein === "Doesn't Apply") return false;
        return itemContent.includes(protein.toLowerCase());
      }
    );
    
    if (proteinMatches?.length > 0) {
      score += 15;
      reasons.push(`Features ${proteinMatches[0]}, one of your preferred proteins`);
    }

    // Check favorite ingredients
    const ingredientMatches = preferences.favorite_ingredients?.filter(
      (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
    );

    if (ingredientMatches?.length > 0) {
      score += 15;
      reasons.push(`Contains ${ingredientMatches[0]}, which you love`);
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

    // Determine match type based on final score
    let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
    if (score >= 90) {
      matchType = 'perfect';
    } else if (score >= 75) {
      matchType = 'good';
    } else if (score < 40) {
      matchType = 'warning';
    }

    // Cap score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    console.log('✅ Analysis complete:', { score, matchType, reason: reasons[0] });

    return {
      score,
      reason: reasons[0],
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