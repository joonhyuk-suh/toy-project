import {
  Apple,
  Cake,
  CakeSlice,
  Cherry,
  Citrus,
  Coffee,
  Cookie,
  Croissant,
  Flame,
  GlassWater,
  Grape,
  Leaf,
  Lollipop,
  Martini,
  Milk,
  Popcorn,
  Sandwich,
  Wine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  apple: Apple,
  cake: Cake,
  "cake-slice": CakeSlice,
  cherry: Cherry,
  citrus: Citrus,
  coffee: Coffee,
  cookie: Cookie,
  croissant: Croissant,
  flame: Flame,
  "glass-water": GlassWater,
  grape: Grape,
  leaf: Leaf,
  lollipop: Lollipop,
  martini: Martini,
  milk: Milk,
  popcorn: Popcorn,
  sandwich: Sandwich,
  wine: Wine,
};

export function FoodIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Coffee;
  return <Icon className={className} strokeWidth={1.3} aria-hidden />;
}
