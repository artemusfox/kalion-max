// ═══════════════════════════════════════
// KALION MAX — Built-in Lebensmittel-Datenbank
// Gängige Lebensmittel mit Nährwerten (pro 100g/ml wenn nicht anders angegeben)
// ═══════════════════════════════════════

export type Food = {
  id: string;
  name: string;
  brand?: string;
  category: FoodCategory;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
};

export type FoodCategory = 
  | "protein" | "carbs" | "fats" | "veggies" | "fruits" 
  | "dairy" | "drinks" | "snacks" | "prepared" | "supplements";

export const FOOD_CATEGORIES: Record<FoodCategory, { label: string; icon: string; color: string }> = {
  protein:     { label: "Proteinquellen", icon: "🥩", color: "#FF5A6B" },
  carbs:       { label: "Kohlenhydrate",  icon: "🍞", color: "#FFB800" },
  fats:        { label: "Fette",          icon: "🥑", color: "#52D983" },
  veggies:     { label: "Gemüse",         icon: "🥦", color: "#2DD4BF" },
  fruits:      { label: "Obst",           icon: "🍎", color: "#F472B6" },
  dairy:       { label: "Milchprodukte",  icon: "🥛", color: "#60A5FA" },
  drinks:      { label: "Getränke",       icon: "🥤", color: "#22D3EE" },
  snacks:      { label: "Snacks",         icon: "🍫", color: "#8B7FF0" },
  prepared:    { label: "Fertiggerichte", icon: "🍲", color: "#FF8B6B" },
  supplements: { label: "Supplements",    icon: "💊", color: "#7C8AFF" },
};

export const BUILT_IN_FOODS: Food[] = [
  // ═══════════ PROTEIN ═══════════
  { id: "chicken_breast", name: "Hähnchenbrust", category: "protein", servingSize: 100, servingUnit: "g", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: "beef_lean", name: "Rindfleisch mager", category: "protein", servingSize: 100, servingUnit: "g", calories: 217, protein: 26, carbs: 0, fat: 12 },
  { id: "salmon", name: "Lachs", category: "protein", servingSize: 100, servingUnit: "g", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { id: "tuna", name: "Thunfisch", category: "protein", servingSize: 100, servingUnit: "g", calories: 132, protein: 28, carbs: 0, fat: 1 },
  { id: "egg", name: "Ei (ganz)", category: "protein", servingSize: 1, servingUnit: "Stück", calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8 },
  { id: "egg_white", name: "Eiweiß", category: "protein", servingSize: 1, servingUnit: "Stück", calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1 },
  { id: "pork_loin", name: "Schweinelende", category: "protein", servingSize: 100, servingUnit: "g", calories: 143, protein: 26, carbs: 0, fat: 3.5 },
  { id: "turkey", name: "Putenbrust", category: "protein", servingSize: 100, servingUnit: "g", calories: 135, protein: 30, carbs: 0, fat: 1 },
  { id: "cod", name: "Kabeljau", category: "protein", servingSize: 100, servingUnit: "g", calories: 82, protein: 18, carbs: 0, fat: 0.7 },
  { id: "tofu", name: "Tofu", category: "protein", servingSize: 100, servingUnit: "g", calories: 144, protein: 17, carbs: 2.8, fat: 9 },
  { id: "tempeh", name: "Tempeh", category: "protein", servingSize: 100, servingUnit: "g", calories: 192, protein: 20, carbs: 7.6, fat: 11 },
  { id: "seitan", name: "Seitan", category: "protein", servingSize: 100, servingUnit: "g", calories: 370, protein: 75, carbs: 14, fat: 1.9 },
  { id: "lentils_cooked", name: "Linsen (gekocht)", category: "protein", servingSize: 100, servingUnit: "g", calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 },
  { id: "chickpeas_cooked", name: "Kichererbsen (gekocht)", category: "protein", servingSize: 100, servingUnit: "g", calories: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 7.6 },
  { id: "black_beans", name: "Schwarze Bohnen", category: "protein", servingSize: 100, servingUnit: "g", calories: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 8.7 },

  // ═══════════ CARBS ═══════════
  { id: "rice_white", name: "Reis weiß (gekocht)", category: "carbs", servingSize: 100, servingUnit: "g", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: "rice_brown", name: "Reis Vollkorn (gekocht)", category: "carbs", servingSize: 100, servingUnit: "g", calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8 },
  { id: "pasta_cooked", name: "Nudeln (gekocht)", category: "carbs", servingSize: 100, servingUnit: "g", calories: 157, protein: 5.8, carbs: 31, fat: 0.9 },
  { id: "pasta_whole", name: "Vollkornnudeln (gekocht)", category: "carbs", servingSize: 100, servingUnit: "g", calories: 124, protein: 5.3, carbs: 27, fat: 0.5, fiber: 3.9 },
  { id: "potato", name: "Kartoffel", category: "carbs", servingSize: 100, servingUnit: "g", calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  { id: "sweet_potato", name: "Süßkartoffel", category: "carbs", servingSize: 100, servingUnit: "g", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
  { id: "oats", name: "Haferflocken", category: "carbs", servingSize: 50, servingUnit: "g", calories: 190, protein: 6.5, carbs: 33, fat: 3.5, fiber: 5 },
  { id: "bread_whole", name: "Vollkornbrot", category: "carbs", servingSize: 1, servingUnit: "Scheibe", calories: 80, protein: 4, carbs: 14, fat: 1.1, fiber: 2 },
  { id: "bread_white", name: "Weißbrot", category: "carbs", servingSize: 1, servingUnit: "Scheibe", calories: 79, protein: 2.7, carbs: 14.8, fat: 1 },
  { id: "quinoa_cooked", name: "Quinoa (gekocht)", category: "carbs", servingSize: 100, servingUnit: "g", calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
  { id: "couscous_cooked", name: "Couscous (gekocht)", category: "carbs", servingSize: 100, servingUnit: "g", calories: 112, protein: 3.8, carbs: 23, fat: 0.2 },

  // ═══════════ FATS ═══════════
  { id: "avocado", name: "Avocado", category: "fats", servingSize: 100, servingUnit: "g", calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  { id: "olive_oil", name: "Olivenöl", category: "fats", servingSize: 1, servingUnit: "EL", calories: 120, protein: 0, carbs: 0, fat: 14 },
  { id: "peanut_butter", name: "Erdnussbutter", category: "fats", servingSize: 1, servingUnit: "EL", calories: 94, protein: 4, carbs: 3.1, fat: 8 },
  { id: "almonds", name: "Mandeln", category: "fats", servingSize: 30, servingUnit: "g", calories: 173, protein: 6, carbs: 6, fat: 15, fiber: 3.5 },
  { id: "walnuts", name: "Walnüsse", category: "fats", servingSize: 30, servingUnit: "g", calories: 196, protein: 4.6, carbs: 4, fat: 19.5, fiber: 2 },
  { id: "cashews", name: "Cashews", category: "fats", servingSize: 30, servingUnit: "g", calories: 166, protein: 4.5, carbs: 9.2, fat: 13 },
  { id: "chia_seeds", name: "Chiasamen", category: "fats", servingSize: 15, servingUnit: "g", calories: 73, protein: 2.5, carbs: 6.3, fat: 4.6, fiber: 5.2 },
  { id: "flax_seeds", name: "Leinsamen", category: "fats", servingSize: 15, servingUnit: "g", calories: 80, protein: 2.7, carbs: 4.4, fat: 6.3, fiber: 4.1 },
  { id: "butter", name: "Butter", category: "fats", servingSize: 10, servingUnit: "g", calories: 72, protein: 0.1, carbs: 0.1, fat: 8.1 },

  // ═══════════ VEGGIES ═══════════
  { id: "broccoli", name: "Brokkoli", category: "veggies", servingSize: 100, servingUnit: "g", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  { id: "spinach", name: "Spinat", category: "veggies", servingSize: 100, servingUnit: "g", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { id: "carrot", name: "Karotte", category: "veggies", servingSize: 100, servingUnit: "g", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  { id: "cucumber", name: "Gurke", category: "veggies", servingSize: 100, servingUnit: "g", calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  { id: "tomato", name: "Tomate", category: "veggies", servingSize: 100, servingUnit: "g", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { id: "pepper_red", name: "Paprika rot", category: "veggies", servingSize: 100, servingUnit: "g", calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  { id: "lettuce", name: "Salat", category: "veggies", servingSize: 100, servingUnit: "g", calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
  { id: "onion", name: "Zwiebel", category: "veggies", servingSize: 100, servingUnit: "g", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  { id: "zucchini", name: "Zucchini", category: "veggies", servingSize: 100, servingUnit: "g", calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
  { id: "cauliflower", name: "Blumenkohl", category: "veggies", servingSize: 100, servingUnit: "g", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2 },

  // ═══════════ FRUITS ═══════════
  { id: "banana", name: "Banane", category: "fruits", servingSize: 1, servingUnit: "Stück (120g)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1 },
  { id: "apple", name: "Apfel", category: "fruits", servingSize: 1, servingUnit: "Stück (180g)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
  { id: "orange", name: "Orange", category: "fruits", servingSize: 1, servingUnit: "Stück (150g)", calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1 },
  { id: "strawberries", name: "Erdbeeren", category: "fruits", servingSize: 100, servingUnit: "g", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9 },
  { id: "blueberries", name: "Blaubeeren", category: "fruits", servingSize: 100, servingUnit: "g", calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10 },
  { id: "grapes", name: "Weintrauben", category: "fruits", servingSize: 100, servingUnit: "g", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, sugar: 15.5 },
  { id: "pineapple", name: "Ananas", category: "fruits", servingSize: 100, servingUnit: "g", calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4 },
  { id: "mango", name: "Mango", category: "fruits", servingSize: 100, servingUnit: "g", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },

  // ═══════════ DAIRY ═══════════
  { id: "milk_whole", name: "Milch 3,5%", category: "dairy", servingSize: 250, servingUnit: "ml", calories: 150, protein: 8, carbs: 12, fat: 8 },
  { id: "milk_low", name: "Milch 1,5%", category: "dairy", servingSize: 250, servingUnit: "ml", calories: 110, protein: 8.5, carbs: 12, fat: 3.8 },
  { id: "yogurt_greek", name: "Griechischer Joghurt", category: "dairy", servingSize: 100, servingUnit: "g", calories: 97, protein: 9, carbs: 3.6, fat: 5 },
  { id: "yogurt_natural", name: "Naturjoghurt 3,5%", category: "dairy", servingSize: 100, servingUnit: "g", calories: 62, protein: 3.5, carbs: 4.7, fat: 3.5 },
  { id: "cottage_cheese", name: "Hüttenkäse", category: "dairy", servingSize: 100, servingUnit: "g", calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { id: "quark", name: "Magerquark", category: "dairy", servingSize: 100, servingUnit: "g", calories: 67, protein: 12, carbs: 4.1, fat: 0.2 },
  { id: "cheese_gouda", name: "Gouda", category: "dairy", servingSize: 30, servingUnit: "g", calories: 108, protein: 7.5, carbs: 0.4, fat: 8.4 },
  { id: "mozzarella", name: "Mozzarella", category: "dairy", servingSize: 30, servingUnit: "g", calories: 85, protein: 5.4, carbs: 0.7, fat: 6.3 },
  { id: "skyr", name: "Skyr", category: "dairy", servingSize: 100, servingUnit: "g", calories: 63, protein: 11, carbs: 4, fat: 0.2 },

  // ═══════════ DRINKS ═══════════
  { id: "water", name: "Wasser", category: "drinks", servingSize: 250, servingUnit: "ml", calories: 0, protein: 0, carbs: 0, fat: 0 },
  { id: "coffee_black", name: "Kaffee schwarz", category: "drinks", servingSize: 200, servingUnit: "ml", calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  { id: "tea_black", name: "Schwarzer Tee", category: "drinks", servingSize: 200, servingUnit: "ml", calories: 1, protein: 0, carbs: 0.2, fat: 0 },
  { id: "orange_juice", name: "Orangensaft", category: "drinks", servingSize: 200, servingUnit: "ml", calories: 90, protein: 1.4, carbs: 21, fat: 0.4 },
  { id: "beer", name: "Bier", category: "drinks", servingSize: 500, servingUnit: "ml", calories: 215, protein: 2.3, carbs: 17, fat: 0 },
  { id: "red_wine", name: "Rotwein", category: "drinks", servingSize: 150, servingUnit: "ml", calories: 125, protein: 0.1, carbs: 3.8, fat: 0 },

  // ═══════════ SNACKS ═══════════
  { id: "dark_chocolate", name: "Zartbitterschokolade", category: "snacks", servingSize: 30, servingUnit: "g", calories: 165, protein: 2.3, carbs: 13, fat: 12 },
  { id: "chocolate_milk", name: "Vollmilchschokolade", category: "snacks", servingSize: 30, servingUnit: "g", calories: 159, protein: 2.4, carbs: 17, fat: 8.9 },
  { id: "chips", name: "Kartoffelchips", category: "snacks", servingSize: 30, servingUnit: "g", calories: 160, protein: 2, carbs: 15, fat: 10 },
  { id: "popcorn", name: "Popcorn (gepoppt)", category: "snacks", servingSize: 30, servingUnit: "g", calories: 115, protein: 3.5, carbs: 23, fat: 1.3, fiber: 4.2 },
  { id: "protein_bar", name: "Proteinriegel", category: "snacks", servingSize: 1, servingUnit: "Riegel (60g)", calories: 200, protein: 20, carbs: 20, fat: 6 },
  { id: "rice_cake", name: "Reiswaffel", category: "snacks", servingSize: 1, servingUnit: "Stück (9g)", calories: 35, protein: 0.7, carbs: 7.3, fat: 0.3 },

  // ═══════════ PREPARED ═══════════
  { id: "pizza_margherita", name: "Pizza Margherita", category: "prepared", servingSize: 1, servingUnit: "Stück (300g)", calories: 750, protein: 28, carbs: 95, fat: 28 },
  { id: "burger", name: "Hamburger", category: "prepared", servingSize: 1, servingUnit: "Stück", calories: 540, protein: 25, carbs: 40, fat: 30 },
  { id: "sushi_roll", name: "Sushi-Rolle (6 Stück)", category: "prepared", servingSize: 1, servingUnit: "Rolle", calories: 200, protein: 8, carbs: 38, fat: 2 },
  { id: "doener", name: "Döner", category: "prepared", servingSize: 1, servingUnit: "Stück", calories: 650, protein: 35, carbs: 55, fat: 28 },
  { id: "salad_caesar", name: "Caesar Salat", category: "prepared", servingSize: 1, servingUnit: "Portion", calories: 450, protein: 25, carbs: 20, fat: 30 },

  // ═══════════ SUPPLEMENTS ═══════════
  { id: "whey_protein", name: "Whey Protein", category: "supplements", servingSize: 30, servingUnit: "g", calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  { id: "casein", name: "Casein", category: "supplements", servingSize: 30, servingUnit: "g", calories: 110, protein: 24, carbs: 4, fat: 0.5 },
  { id: "mass_gainer", name: "Mass Gainer", category: "supplements", servingSize: 100, servingUnit: "g", calories: 380, protein: 22, carbs: 70, fat: 2 },
  { id: "bcaa", name: "BCAA", category: "supplements", servingSize: 10, servingUnit: "g", calories: 40, protein: 10, carbs: 0, fat: 0 },
];

export const FOOD_BY_ID = Object.fromEntries(BUILT_IN_FOODS.map((f) => [f.id, f]));

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const MEAL_TYPES: Record<MealType, { label: string; icon: string; hours: [number, number] }> = {
  breakfast: { label: "Frühstück", icon: "🌅", hours: [5, 10] },
  lunch:     { label: "Mittag",    icon: "☀️", hours: [11, 15] },
  dinner:    { label: "Abendessen", icon: "🌙", hours: [17, 22] },
  snack:     { label: "Snack",     icon: "🍪", hours: [0, 24] },
};

export function guessMealType(): MealType {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return "breakfast";
  if (h >= 11 && h < 15) return "lunch";
  if (h >= 17 && h < 22) return "dinner";
  return "snack";
}

// Gängige Supplement-Presets für Quick-Add
export const SUPPLEMENT_PRESETS = [
  { name: "Whey Protein",   dosage: "30", unit: "g",  purpose: "Muskelaufbau / Recovery", icon: "🥛", color: "#2DD4BF", timing: ["post_workout"] },
  { name: "Creatin",        dosage: "5",  unit: "g",  purpose: "Kraft & Leistung",        icon: "⚡", color: "#FFB800", timing: ["any"] },
  { name: "Vitamin D3",     dosage: "2000", unit: "IE", purpose: "Immunsystem / Knochen", icon: "☀️", color: "#FFB800", timing: ["morning"] },
  { name: "Omega-3",        dosage: "1000", unit: "mg", purpose: "Entzündungshemmend",    icon: "🐟", color: "#60A5FA", timing: ["with_meal"] },
  { name: "Magnesium",      dosage: "400", unit: "mg", purpose: "Muskulatur & Schlaf",    icon: "🌙", color: "#8B7FF0", timing: ["evening"] },
  { name: "Zink",           dosage: "15",  unit: "mg", purpose: "Immunsystem & Testo",    icon: "🛡️", color: "#F472B6", timing: ["morning"] },
  { name: "Multivitamin",   dosage: "1",   unit: "Tbl", purpose: "Allgemeine Nährstoffversorgung", icon: "💊", color: "#22D3EE", timing: ["morning"] },
  { name: "Koffein",        dosage: "200", unit: "mg", purpose: "Pre-Workout / Fokus",    icon: "☕", color: "#FF8B6B", timing: ["pre_workout"] },
  { name: "Beta-Alanin",    dosage: "3",   unit: "g",  purpose: "Muskelausdauer",         icon: "💪", color: "#FF5A6B", timing: ["pre_workout"] },
  { name: "Ashwagandha",    dosage: "600", unit: "mg", purpose: "Stress / Regeneration",  icon: "🌿", color: "#52D983", timing: ["evening"] },
  { name: "Vitamin C",      dosage: "500", unit: "mg", purpose: "Immunsystem",            icon: "🍊", color: "#FFB800", timing: ["morning"] },
  { name: "Probiotika",     dosage: "1",   unit: "Kps", purpose: "Darmflora",             icon: "🦠", color: "#2DD4BF", timing: ["morning"] },
];

export const TIMING_LABELS: Record<string, { label: string; icon: string }> = {
  morning:      { label: "Morgens",      icon: "🌅" },
  breakfast:    { label: "Frühstück",    icon: "🍳" },
  pre_workout:  { label: "Vor Training", icon: "⚡" },
  post_workout: { label: "Nach Training", icon: "💪" },
  with_meal:    { label: "Zur Mahlzeit", icon: "🍽️" },
  evening:      { label: "Abends",       icon: "🌙" },
  bedtime:      { label: "Vor Schlafen", icon: "😴" },
  any:          { label: "Jederzeit",    icon: "⏰" },
};
