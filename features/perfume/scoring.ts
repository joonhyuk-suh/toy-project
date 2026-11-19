import type { LayerFilter, Match, Perfume } from "./types";

/** 많은 향수에 든 노트일수록 가볍게, 드문 노트일수록 무겁게 센다. */
export function noteWeight(total: number): number {
  return 1 / Math.log2(2 + total);
}

const SIGNATURE_BOOST = 1.4;
const MAX_PCT = 98;

function poolOf(p: Perfume, layer: LayerFilter): string[] | null {
  if (layer === "any") return p.notes;
  return p.pyramid ? p.pyramid[layer] : null;
}

/** 고른 재료 목록과 향수의 궁합. 겹치는 재료가 없거나 층 정보가 없으면 null. */
export function matchNotes(
  p: Perfume,
  wanted: string[],
  layer: LayerFilter,
  weight: (note: string) => number,
): Match | null {
  const pool = poolOf(p, layer);
  if (!pool) return null;
  const hit = wanted.filter((n) => pool.includes(n));
  if (!hit.length) return null;
  const total = wanted.reduce((a, n) => a + weight(n), 0);
  const got = hit.reduce((a, n) => a + weight(n) * (p.sig.includes(n) ? SIGNATURE_BOOST : 1), 0);
  return { pct: Math.min(MAX_PCT, Math.round((got / total) * 100)), hit };
}

/** 고른 음식 조합과 향수의 궁합. 음식 연결 비율 45% + 드문 재료 가중치 55%. */
export function matchFoods(
  p: Perfume,
  foods: { id: string; notes: string[] }[],
  weight: (note: string) => number,
): (Match & { foodsByNote: Record<string, string[]> }) | null {
  const wanted = [...new Set(foods.flatMap((f) => f.notes))];
  const base = matchNotes(p, wanted, "any", weight);
  if (!base) return null;
  const foodsByNote: Record<string, string[]> = {};
  for (const n of base.hit) foodsByNote[n] = foods.filter((f) => f.notes.includes(n)).map((f) => f.id);
  const linked = new Set(Object.values(foodsByNote).flat()).size;
  const coverage = linked / Math.max(1, foods.length);
  const pct = Math.min(MAX_PCT, Math.round(100 * (0.45 * coverage + 0.55 * (base.pct / 100))));
  return { pct, hit: base.hit, foodsByNote };
}
