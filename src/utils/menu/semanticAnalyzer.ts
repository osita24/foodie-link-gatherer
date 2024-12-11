import { pipeline } from "@huggingface/transformers";

let classifier: any = null;

const initializeClassifier = async () => {
  if (!classifier) {
    console.log("🤖 Initializing food classifier...");
    classifier = await pipeline(
      "zero-shot-classification",
      "facebook/bart-large-mnli",
      { device: "cpu" }
    );
  }
  return classifier;
};

export const analyzeDishSemantics = async (itemContent: string) => {
  console.log("🔍 Analyzing dish semantics for:", itemContent);
  
  const classifier = await initializeClassifier();
  
  // Analyze preparation method
  const prepMethods = await classifier(itemContent, [
    "fried food",
    "grilled food",
    "baked food",
    "steamed food",
    "raw food"
  ]);
  
  // Analyze main ingredients
  const ingredients = await classifier(itemContent, [
    "contains meat",
    "contains dairy",
    "contains gluten",
    "contains nuts",
    "contains seafood",
    "contains eggs",
    "vegetarian dish",
    "vegan dish"
  ]);
  
  // Analyze cuisine type
  const cuisine = await classifier(itemContent, [
    "Italian cuisine",
    "Asian cuisine",
    "Mexican cuisine",
    "Mediterranean cuisine",
    "American cuisine"
  ]);

  console.log("✨ Semantic analysis results:", {
    prepMethods: prepMethods.scores,
    ingredients: ingredients.scores,
    cuisine: cuisine.scores
  });

  return {
    prepMethod: prepMethods.labels[0],
    prepScore: prepMethods.scores[0],
    mainIngredients: ingredients.labels.filter((_: string, i: number) => ingredients.scores[i] > 0.5),
    cuisineType: cuisine.labels[0],
    cuisineScore: cuisine.scores[0]
  };
};