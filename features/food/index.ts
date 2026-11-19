import { listPerfumes, matchFoods, noteInfo, noteWeight } from "@/features/perfume";
import type { FamilyId, Match, Perfume } from "@/features/perfume";

import { CATEGORIES, FOODS, PRESETS } from "./foods";
import type { CategoryFilter, Food } from "./foods";

export { CATEGORIES, FOODS, PRESETS };
export type { CategoryFilter, Food };

export const MAX_PICK = 5;

const BY_ID = new Map(FOODS.map((f) => [f.id, f]));

export const getFood = (id: string): Food | undefined => BY_ID.get(id);

export function filterFoods({ category, query }: { category: CategoryFilter; query: string }): Food[] {
  const q = query.trim();
  return FOODS.filter(
    (f) =>
      (category === "전체" || f.category === category) &&
      (!q || (f.name + f.alias + f.ingredients.map((i) => i.name).join("")).includes(q)),
  );
}

/** 고른 순서대로 쌓고, 다시 누르면 푼다. 5개가 차면 새 음식은 고를 수 없다. */
export function togglePick(picked: string[], id: string): string[] {
  if (picked.includes(id)) return picked.filter((x) => x !== id);
  if (picked.length >= MAX_PICK) return picked;
  return [...picked, id];
}

/** 링크의 쉼표 목록에서 실제 있는 음식만 순서대로 최대 5개 읽는다. */
export function parseFoodIds(param: string | null | undefined): string[] {
  if (!param) return [];
  const ids: string[] = [];
  for (const id of param.split(",")) if (BY_ID.has(id) && !ids.includes(id)) ids.push(id);
  return ids.slice(0, MAX_PICK);
}

export type PlateNote = { note: string; foods: Food[] };

/** 고른 음식들의 재료. 2개 이상의 음식에 든 재료(common)와 나머지(solo)로 나눈다. */
export function plateNotes(ids: string[]): { common: PlateNote[]; solo: PlateNote[] } {
  const map = new Map<string, Food[]>();
  for (const id of ids) {
    const food = BY_ID.get(id);
    if (!food) continue;
    for (const { note } of food.ingredients) {
      if (note) map.set(note, [...(map.get(note) ?? []), food]);
    }
  }
  const all = [...map].map(([note, foods]) => ({ note, foods: [...new Set(foods)] }));
  return { common: all.filter((x) => x.foods.length > 1), solo: all.filter((x) => x.foods.length === 1) };
}

const weightOf = (note: string) => noteWeight(noteInfo(note)?.total ?? 100);

export type FoodRecommendation = {
  perfume: Perfume;
  match: Match & { foodsByNote: Record<string, string[]> };
};

/** 고른 음식의 재료가 하나라도 들어간 향수를 궁합 점수 높은 순으로 돌려준다. */
export function recommend(ids: string[]): FoodRecommendation[] {
  const foods = [...new Set(ids)]
    .map((id) => BY_ID.get(id))
    .filter((f): f is Food => !!f)
    .map((f) => ({ id: f.id, notes: f.ingredients.flatMap((i) => (i.note ? [i.note] : [])) }))
    .filter((f) => f.notes.length);
  if (!foods.length) return [];
  const sortedFoods = [...foods].sort((a, b) => a.id.localeCompare(b.id));
  return listPerfumes()
    .flatMap((perfume) => {
      const match = matchFoods(perfume, sortedFoods, weightOf);
      return match ? [{ perfume, match }] : [];
    })
    .sort((a, b) => b.match.pct - a.match.pct || a.perfume.slug.localeCompare(b.perfume.slug));
}

const PERSONA: Partial<Record<FamilyId, string>> = {
  sweet: "포근한 디저트파",
  green: "차분한 티타임파",
  citrus: "상큼한 에이드파",
  fruit: "과즙 가득 과일파",
  floral: "로맨틱 꽃다발파",
  musk: "깨끗한 살냄새파",
  spice: "따뜻한 향신료파",
};

export const personaOf = (family: FamilyId): string => PERSONA[family] ?? "나만의 조합파";

export { FoodIcon } from "./food-icon";


/** 음식 칩의 색: 첫 번째 향수 재료의 계열 색을 쓴다. */
export function foodFamily(food: Food) {
  const note = food.ingredients.find((i) => i.note)?.note;
  return (note && noteInfo(note)?.family) || "sweet";
}
