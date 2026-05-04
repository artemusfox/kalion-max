// ═══════════════════════════════════════════════════════════
// Static Data Translations — Übungen, Lebensmittel, Badges, Templates
// Keys = Original-IDs aus den Lib-Files, Values = englische Übersetzung.
// Helper-Funktionen am Ende geben je nach Lang DE oder EN zurück.
// ═══════════════════════════════════════════════════════════

import type { Lang } from "./i18n";

// ── Übungs-Namen (EN) ──
export const EXERCISE_NAMES_EN: Record<string, string> = {
  // Strength
  bench_press: "Bench Press",
  incline_bench: "Incline Bench Press",
  dumbbell_press: "Dumbbell Bench Press",
  db_flyes: "Dumbbell Flyes",
  cable_crossover: "Cable Crossover",
  deadlift: "Deadlift",
  barbell_row: "Barbell Row",
  pullup: "Pull-up",
  lat_pulldown: "Lat Pulldown",
  seated_row: "Seated Row",
  ohp: "Overhead Press",
  db_shoulder_press: "DB Shoulder Press",
  lateral_raise: "Lateral Raise",
  face_pull: "Face Pull",
  rear_delt_fly: "Rear Delt Fly",
  bicep_curl: "Bicep Curl",
  hammer_curl: "Hammer Curl",
  tricep_pushdown: "Tricep Pushdown",
  skullcrusher: "Skullcrusher",
  preacher_curl: "Preacher Curl",
  back_squat: "Back Squat",
  front_squat: "Front Squat",
  leg_press: "Leg Press",
  leg_curl: "Leg Curl",
  leg_extension: "Leg Extension",
  rdl: "Romanian Deadlift",
  lunges_weighted: "Weighted Lunges",
  hip_thrust: "Hip Thrust",
  glute_bridge: "Glute Bridge",
  weighted_plank: "Weighted Plank",
  cable_crunch: "Cable Crunch",
  // Calisthenics
  pushup: "Push-up",
  knee_pushup: "Knee Push-up",
  incline_pushup: "Incline Push-up",
  diamond_pushup: "Diamond Push-up",
  pike_pushup: "Pike Push-up",
  archer_pushup: "Archer Push-up",
  dips_bars: "Dips",
  aus_pullup: "Australian Pull-up",
  neg_pullup: "Negative Pull-up",
  chinup: "Chin-up",
  deadhang: "Dead Hang",
  bw_squat: "Bodyweight Squat",
  pistol_squat: "Pistol Squat",
  bulgarian_split: "Bulgarian Split Squat",
  nordic_curl: "Nordic Curl",
  plank: "Plank",
  hollow_body: "Hollow Body Hold",
  l_sit: "L-Sit",
  dragon_flag: "Dragon Flag",
  handstand_wall: "Wall Handstand",
  muscle_up: "Muscle-up",
  // Cardio
  running: "Running",
  treadmill_run: "Treadmill Run",
  cycling: "Cycling",
  rowing: "Rowing",
  elliptical: "Elliptical",
  stair_climber: "Stairmaster",
  jumprope: "Jump Rope",
  swimming: "Swimming",
  // HIIT
  burpee: "Burpee",
  kb_swing: "Kettlebell Swing",
  box_jump: "Box Jump",
  mountain_climber: "Mountain Climber",
  jumping_lunges: "Jumping Lunge",
  thruster: "Thruster",
  wall_ball: "Wall Ball",
  battle_rope: "Battle Ropes",
  clean: "Clean",
  snatch: "Snatch",
  // Mobility
  sun_salutation: "Sun Salutation",
  downward_dog: "Downward Dog",
  pigeon_pose: "Pigeon Pose",
  couch_stretch: "Couch Stretch",
  cat_cow: "Cat-Cow",
  cobra: "Cobra Pose",
  warrior_2: "Warrior II",
  childs_pose: "Child's Pose",
  shoulder_stretch: "Shoulder Stretch",
  hamstring_stretch: "Hamstring Stretch",
  foam_roll: "Foam Rolling",
};

// ── Übungs-Tipps (EN) ──
export const EXERCISE_TIPS_EN: Record<string, string> = {
  bench_press: "Flat bench, elbows ~45°, shoulder blades retracted.",
  incline_bench: "30-45° incline — emphasizes upper chest.",
  dumbbell_press: "Greater range of motion than barbell.",
  db_flyes: "Keep slight bend in elbows.",
  cable_crossover: "Cross arms in front of chest for max contraction.",
  deadlift: "Neutral spine, bar close to body, drive hips through.",
  barbell_row: "Torso ~45°, pull to belly button.",
  pullup: "Chin over bar, lower with control.",
  lat_pulldown: "Wide grip, pull to chest.",
  seated_row: "Straight back, squeeze shoulder blades.",
  ohp: "Press bar overhead — stable core!",
  db_shoulder_press: "Seated or standing, elbows under hands.",
  lateral_raise: "Slightly bent, lift to shoulder height.",
  face_pull: "High cable, pull to face.",
  rear_delt_fly: "For rear delts.",
  bicep_curl: "Elbows fixed, no swinging.",
  hammer_curl: "Neutral grip — also hits brachialis.",
  tricep_pushdown: "Elbows at sides, only forearms move.",
  skullcrusher: "Elbows stay locked.",
  preacher_curl: "Full stretch at bottom, no momentum.",
  back_squat: "Deep, knees over toes, straight back.",
  front_squat: "Bar on shoulders — upright torso.",
  leg_press: "Don't press into lumbar curve.",
  leg_curl: "For hamstrings.",
  leg_extension: "Isolates quadriceps.",
  rdl: "Hips back, slight knee bend.",
  lunges_weighted: "Back knee almost to floor.",
  hip_thrust: "1s squeeze at top.",
  glute_bridge: "Hold at top, squeeze glutes.",
  weighted_plank: "Plate on back for extra challenge.",
  cable_crunch: "Contract abs — not arms.",
  pushup: "Shoulder-width, elbows ~45°, full body tension.",
  knee_pushup: "Knees on floor — easier variant.",
  incline_pushup: "Hands on chair/bench — easier.",
  diamond_pushup: "Hands close — tricep focus.",
  pike_pushup: "Hips up (inverted V).",
  archer_pushup: "One arm extended, the other pressing.",
  dips_bars: "Slight forward lean — targets chest.",
  aus_pullup: "Bar at hip height, pull body straight.",
  neg_pullup: "Lower slowly from top (4-5s).",
  chinup: "Underhand grip — more biceps.",
  deadhang: "Active shoulders.",
  bw_squat: "Deep, knees over toes.",
  pistol_squat: "Free single-leg — needs balance.",
  bulgarian_split: "Rear foot elevated.",
  nordic_curl: "Feet anchored, slow lean forward.",
  plank: "Straight line, brace abs.",
  hollow_body: "Lying down, lower back on floor.",
  l_sit: "Hold legs horizontal.",
  dragon_flag: "Body straight from shoulders.",
  handstand_wall: "Belly to wall, hands ~20cm out.",
  muscle_up: "Explosive up, elbows over bar.",
  running: "Pace by breath and heart rate.",
  treadmill_run: "1-2% incline simulates outdoor.",
  cycling: "Try different cadences.",
  rowing: "Drive with legs — then pull with arms.",
  elliptical: "Joint-friendly, full body.",
  stair_climber: "Leg focus.",
  jumprope: "Elbows close, small jumps.",
  swimming: "Technique matters more than speed.",
  burpee: "Chest to floor, then jump.",
  kb_swing: "Power from hips, not shoulders.",
  box_jump: "Land controlled, walk down.",
  mountain_climber: "Plank position, knees to chest.",
  jumping_lunges: "Explosively switch.",
  thruster: "Squat + push press combined.",
  wall_ball: "Squat + throw against wall.",
  battle_rope: "Fast waves, stable core.",
  clean: "Floor → shoulder in one explosive move.",
  snatch: "Floor → overhead, single-arm variants possible.",
  sun_salutation: "Flowing motion — sync with breath.",
  downward_dog: "Press heels toward floor.",
  pigeon_pose: "Deep hip opening.",
  couch_stretch: "Foot on wall, deep hip flexor stretch.",
  cat_cow: "Alternate rounding and arching.",
  cobra: "Lift chest, hips on floor.",
  warrior_2: "Deep lunge, arms parallel.",
  childs_pose: "Restorative pose — breathe deeply.",
  shoulder_stretch: "Pull arm across body.",
  hamstring_stretch: "Straight legs, fold forward.",
  foam_roll: "Roll out tight spots slowly.",
};

// ── Helper: localized Übungs-Name ──
export function exerciseName(id: string, fallbackDe: string, lang: Lang): string {
  if (lang === "en") return EXERCISE_NAMES_EN[id] || fallbackDe;
  return fallbackDe;
}

export function exerciseTip(id: string, fallbackDe: string | undefined, lang: Lang): string | undefined {
  if (!fallbackDe) return undefined;
  if (lang === "en") return EXERCISE_TIPS_EN[id] || fallbackDe;
  return fallbackDe;
}

// ── BADGE-Übersetzungen (EN) ──
export const BADGE_TRANSLATIONS_EN: Record<string, { name: string; desc: string }> = {
  first_workout:  { name: "First Step",        desc: "Your very first workout" },
  week_complete:  { name: "Week Warrior",      desc: "Completed a full week" },
  streak_3:       { name: "Picking Up",        desc: "3-day streak" },
  streak_7:       { name: "Unstoppable",       desc: "7-day streak" },
  streak_30:      { name: "Legend",            desc: "30-day streak" },
  streak_100:     { name: "Immortal",          desc: "100-day streak" },
  first_pr:       { name: "First PR",          desc: "Your first personal record" },
  plan_created:   { name: "Architect",         desc: "Created your first plan" },
  photo_first:    { name: "In the Mirror",     desc: "First progress photo" },
  measure_first:  { name: "Data Lover",        desc: "First measurement logged" },
  workouts_10:    { name: "First 10",          desc: "10 workouts done" },
  workouts_50:    { name: "Half Marathon",     desc: "50 workouts" },
  workouts_100:   { name: "Centurion",         desc: "100 workouts" },
  multisport:     { name: "All-rounder",       desc: "Trained in 3 different sports" },
};

export function badgeName(key: string, fallbackDe: string, lang: Lang): string {
  if (lang === "en") return BADGE_TRANSLATIONS_EN[key]?.name || fallbackDe;
  return fallbackDe;
}

export function badgeDesc(key: string, fallbackDe: string, lang: Lang): string {
  if (lang === "en") return BADGE_TRANSLATIONS_EN[key]?.desc || fallbackDe;
  return fallbackDe;
}

// ── PLAN-TEMPLATE-Übersetzungen (EN) ──
export const TEMPLATE_TRANSLATIONS_EN: Record<string, { name: string; description: string }> = {
  tpl_strength_fb_beginner: {
    name: "Full Body Beginner",
    description: "3 sessions per week — full-body workouts, perfect for getting into strength training.",
  },
  tpl_strength_ppl: {
    name: "Push / Pull / Legs",
    description: "Classic 4-day split — push, pull, legs, and a heavy push volume day. 12 weeks.",
  },
  tpl_calisthenics_12w: {
    name: "Calisthenics 12 Weeks Beginner",
    description: "Bodyweight only — push-ups, pull-ups, squats, core. Build a foundation in 12 weeks.",
  },
  tpl_cardio_5k: {
    name: "5K Plan",
    description: "8 weeks from couch to 5K — gentle progression for cardio beginners.",
  },
  tpl_hiit_fatburner: {
    name: "HIIT Fat Burner",
    description: "Short, intense 25-minute sessions — 4 weeks for max fat loss.",
  },
  tpl_mobility_daily: {
    name: "Daily Mobility & Yoga",
    description: "Short daily sessions — flexibility, mobility, recovery. Perfect as add-on.",
  },
};

// ── Workout-Day-Names (EN) — gängige Tages-Bezeichnungen ──
export const DAY_NAME_TRANSLATIONS_EN: Record<string, string> = {
  "Workout A": "Workout A",
  "Workout B": "Workout B",
  "Workout A (Heavy)": "Workout A (Heavy)",
  "Push Day": "Push Day",
  "Pull Day": "Pull Day",
  "Leg Day": "Leg Day",
  "Push Day (Volumen)": "Push Day (Volume)",
  "Push Day (Volume)": "Push Day (Volume)",
  "Oberkörper": "Upper Body",
  "Unterkörper": "Lower Body",
  "Cardio": "Cardio",
  "Mobility": "Mobility",
  "Yoga": "Yoga",
  "Lauf": "Run",
  "Lauftraining": "Running",
  "HIIT": "HIIT",
  "Brust & Trizeps": "Chest & Triceps",
  "Rücken & Bizeps": "Back & Biceps",
  "Beine & Schultern": "Legs & Shoulders",
  "Ganzkörper": "Full Body",
  "Mo": "Mon",
  "Di": "Tue",
  "Mi": "Wed",
  "Do": "Thu",
  "Fr": "Fri",
  "Sa": "Sat",
  "So": "Sun",
};

export function dayName(name: string, lang: Lang): string {
  if (lang === "en") return DAY_NAME_TRANSLATIONS_EN[name] || name;
  return name;
}

export function dayLabelTr(label: string, lang: Lang): string {
  if (lang === "en") return DAY_NAME_TRANSLATIONS_EN[label] || label;
  return label;
}

export function templateName(id: string, fallbackDe: string, lang: Lang): string {
  if (lang === "en") return TEMPLATE_TRANSLATIONS_EN[id]?.name || fallbackDe;
  return fallbackDe;
}

export function templateDesc(id: string, fallbackDe: string, lang: Lang): string {
  if (lang === "en") return TEMPLATE_TRANSLATIONS_EN[id]?.description || fallbackDe;
  return fallbackDe;
}

// ── Food-Kategorien (EN) ──
export const FOOD_CATEGORY_NAMES_EN: Record<string, string> = {
  protein: "Protein sources",
  carbs: "Carbohydrates",
  fats: "Fats",
  veggies: "Vegetables",
  fruits: "Fruits",
  dairy: "Dairy",
  drinks: "Drinks",
  snacks: "Snacks",
  prepared: "Prepared meals",
  supplements: "Supplements",
};

export function foodCategoryName(key: string, fallbackDe: string, lang: Lang): string {
  if (lang === "en") return FOOD_CATEGORY_NAMES_EN[key] || fallbackDe;
  return fallbackDe;
}

// ── Lebensmittel-Namen (EN) ──
export const FOOD_NAMES_EN: Record<string, string> = {
  // Protein
  chicken_breast: "Chicken breast",
  beef_lean: "Beef (lean)",
  salmon: "Salmon",
  tuna: "Tuna",
  egg: "Egg (whole)",
  egg_white: "Egg white",
  pork_loin: "Pork loin",
  turkey: "Turkey breast",
  cod: "Cod",
  tofu: "Tofu",
  tempeh: "Tempeh",
  seitan: "Seitan",
  lentils_cooked: "Lentils (cooked)",
  chickpeas_cooked: "Chickpeas (cooked)",
  black_beans: "Black beans",
  // Carbs
  rice_white: "White rice (cooked)",
  rice_brown: "Brown rice (cooked)",
  pasta_cooked: "Pasta (cooked)",
  pasta_whole: "Whole-grain pasta (cooked)",
  potato: "Potato",
  sweet_potato: "Sweet potato",
  oats: "Oats",
  bread_whole: "Whole-grain bread",
  bread_white: "White bread",
  quinoa_cooked: "Quinoa (cooked)",
  couscous_cooked: "Couscous (cooked)",
  // Fats
  avocado: "Avocado",
  olive_oil: "Olive oil",
  peanut_butter: "Peanut butter",
  almonds: "Almonds",
  walnuts: "Walnuts",
  cashews: "Cashews",
  chia_seeds: "Chia seeds",
  flax_seeds: "Flax seeds",
  butter: "Butter",
  // Veggies
  broccoli: "Broccoli",
  spinach: "Spinach",
  carrot: "Carrot",
  cucumber: "Cucumber",
  tomato: "Tomato",
  pepper_red: "Red pepper",
  lettuce: "Lettuce",
  onion: "Onion",
  zucchini: "Zucchini",
  cauliflower: "Cauliflower",
  // Fruits
  banana: "Banana",
  apple: "Apple",
  orange: "Orange",
  strawberries: "Strawberries",
  blueberries: "Blueberries",
  grapes: "Grapes",
  pineapple: "Pineapple",
  mango: "Mango",
  // Dairy
  milk_whole: "Milk (3.5%)",
  milk_low: "Milk (1.5%)",
  yogurt_greek: "Greek yogurt",
  yogurt_natural: "Plain yogurt (3.5%)",
  cottage_cheese: "Cottage cheese",
  quark: "Quark (low-fat)",
  cheese_gouda: "Gouda cheese",
  mozzarella: "Mozzarella",
  skyr: "Skyr",
  // Drinks
  water: "Water",
  coffee_black: "Black coffee",
  tea_black: "Black tea",
  orange_juice: "Orange juice",
  beer: "Beer",
  red_wine: "Red wine",
  // Snacks
  dark_chocolate: "Dark chocolate",
  chocolate_milk: "Milk chocolate",
  chips: "Potato chips",
  popcorn: "Popcorn (popped)",
  protein_bar: "Protein bar",
  rice_cake: "Rice cake",
  // Prepared
  pizza_margherita: "Pizza Margherita",
  burger: "Hamburger",
  sushi_roll: "Sushi roll (6 pieces)",
  doener: "Kebab",
  salad_caesar: "Caesar salad",
  // Supplements
  whey_protein: "Whey protein",
  casein: "Casein",
  mass_gainer: "Mass gainer",
  bcaa: "BCAA",
};

export function foodName(id: string, fallbackDe: string, lang: Lang): string {
  if (lang === "en") return FOOD_NAMES_EN[id] || fallbackDe;
  return fallbackDe;
}

// ── Serving-Units (EN) ──
export const SERVING_UNIT_EN: Record<string, string> = {
  "Stück": "piece",
  "g": "g",
  "ml": "ml",
};

export function servingUnit(de: string, lang: Lang): string {
  if (lang === "en") return SERVING_UNIT_EN[de] || de;
  return de;
}

// ── Supplement-Templates (EN) ──
// Diese sind die "vorgefertigten" Supplements, die User aus einer Liste wählen können.
export const SUPPLEMENT_TRANSLATIONS_EN: Record<string, { name: string; purpose: string }> = {
  whey:        { name: "Whey Protein",         purpose: "Muscle protein synthesis" },
  creatine:    { name: "Creatine Monohydrate", purpose: "Strength + power output" },
  multi:       { name: "Multivitamin",         purpose: "Daily micronutrient base" },
  vitamin_d:   { name: "Vitamin D3",           purpose: "Bone health + immunity" },
  omega_3:     { name: "Omega-3 (Fish Oil)",   purpose: "Anti-inflammatory" },
  magnesium:   { name: "Magnesium",            purpose: "Muscle recovery + sleep" },
  zinc:        { name: "Zinc",                 purpose: "Immune system + recovery" },
  bcaa:        { name: "BCAA",                 purpose: "Reduces muscle breakdown" },
  beta_alanine:{ name: "Beta-Alanine",         purpose: "Endurance + buffering" },
  caffeine:    { name: "Caffeine",             purpose: "Pre-workout focus" },
  ashwagandha: { name: "Ashwagandha",          purpose: "Stress + cortisol management" },
  collagen:    { name: "Collagen",             purpose: "Joint + skin support" },
};

export function supplementName(key: string, fallbackDe: string, lang: Lang): string {
  if (lang === "en") return SUPPLEMENT_TRANSLATIONS_EN[key]?.name || fallbackDe;
  return fallbackDe;
}

export function supplementPurpose(key: string, fallbackDe: string, lang: Lang): string {
  if (lang === "en") return SUPPLEMENT_TRANSLATIONS_EN[key]?.purpose || fallbackDe;
  return fallbackDe;
}
