export interface DietaryRestriction {
  name: string;
  forbiddenIngredients: string[];
  forbiddenTypes: string[];
}

export const DIETARY_RESTRICTIONS: Record<string, DietaryRestriction> = {
  'Vegetarian': {
    name: 'Vegetarian',
    forbiddenIngredients: [
      'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb', 'turkey',
      'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni', 'anchovy',
      'duck', 'veal', 'foie gras', 'chorizo', 'sausage'
    ],
    forbiddenTypes: [
      'steakhouse', 'bbq', 'meat', 'seafood', 'fish'
    ]
  },
  'Vegan': {
    name: 'Vegan',
    forbiddenIngredients: [
      'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb', 'turkey',
      'cheese', 'cream', 'milk', 'egg', 'butter', 'honey', 'yogurt', 'mayo',
      'bacon', 'prosciutto', 'ham', 'salami', 'pepperoni', 'anchovy',
      'duck', 'veal', 'foie gras', 'chorizo', 'sausage', 'gelatin',
      'whey', 'casein', 'ghee', 'lard', 'aioli'
    ],
    forbiddenTypes: [
      'steakhouse', 'bbq', 'meat', 'seafood', 'fish', 'ice cream', 'dairy'
    ]
  }
};