// Shared health-safe game objects used across the kids games.
// No external assets — every object is drawn as inline SVG (see KidsObject.tsx).

export type Bi = { ar: string; en: string };

export type ObjectId =
  | "water"
  | "apple"
  | "heart"
  | "star"
  | "moon"
  | "tooth"
  | "shield"
  | "leaf"
  | "carrot"
  | "soap"
  | "sun"
  | "banana";

export type GameObject = {
  id: ObjectId;
  label: Bi;
  /** Main glow / accent color for the object. */
  color: string;
};

export const GAME_OBJECTS: Record<ObjectId, GameObject> = {
  water: { id: "water", label: { ar: "قطرة ماء", en: "Water drop" }, color: "#4cc6e8" },
  apple: { id: "apple", label: { ar: "تفاحة", en: "Apple" }, color: "#ff6b81" },
  heart: { id: "heart", label: { ar: "قلب", en: "Heart" }, color: "#ff7eb3" },
  star: { id: "star", label: { ar: "نجمة", en: "Star" }, color: "#ffd56b" },
  moon: { id: "moon", label: { ar: "قمر", en: "Moon" }, color: "#ffe08a" },
  tooth: { id: "tooth", label: { ar: "فرشاة أسنان", en: "Toothbrush" }, color: "#7ee0c8" },
  shield: { id: "shield", label: { ar: "درع", en: "Shield" }, color: "#b4a8ff" },
  leaf: { id: "leaf", label: { ar: "ورقة", en: "Leaf" }, color: "#5fd0a0" },
  carrot: { id: "carrot", label: { ar: "جزرة", en: "Carrot" }, color: "#ffab5e" },
  soap: { id: "soap", label: { ar: "صابون", en: "Soap" }, color: "#9ad8ff" },
  sun: { id: "sun", label: { ar: "شمس", en: "Sun" }, color: "#ffd166" },
  banana: { id: "banana", label: { ar: "موزة", en: "Banana" }, color: "#ffe066" },
};

export const ALL_OBJECT_IDS = Object.keys(GAME_OBJECTS) as ObjectId[];

// Color swatches used by the Color Match game.
export type ColorId = "blue" | "red" | "green" | "yellow" | "pink";

export const GAME_COLORS: Record<ColorId, { label: Bi; hex: string }> = {
  blue: { label: { ar: "أزرق", en: "Blue" }, hex: "#4cc6e8" },
  red: { label: { ar: "أحمر", en: "Red" }, hex: "#ff6b81" },
  green: { label: { ar: "أخضر", en: "Green" }, hex: "#5fd0a0" },
  yellow: { label: { ar: "أصفر", en: "Yellow" }, hex: "#ffd56b" },
  pink: { label: { ar: "وردي", en: "Pink" }, hex: "#ff7eb3" },
};
