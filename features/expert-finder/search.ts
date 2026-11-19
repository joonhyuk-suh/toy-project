import { DURATION_BANDS, FAMILIES, durationOf, listNotes, listPerfumes, matchNotes, noteInfo, noteWeight } from "@/features/perfume";
import type { DurationBand, FamilyId, LayerFilter, Match, Perfume } from "@/features/perfume";

export const MAX_NOTES = 4;

export type ExpertConditions = {
  notes: string[];
  layer: LayerFilter;
  durations: DurationBand[];
};

export type ExpertQuery = ExpertConditions & { family: FamilyId };

const DEFAULT_FAMILY: FamilyId = "sweet";
const LAYERS: LayerFilter[] = ["any", "top", "heart", "base"];

export function toggleNote(notes: string[], key: string): string[] {
  if (notes.includes(key)) return notes.filter((n) => n !== key);
  if (notes.length >= MAX_NOTES) return notes;
  return [...notes, key];
}

/** 계열에 속한 재료. 많은 향수에 쓰이는 재료가 앞에 온다. */
export function notesOfFamily(family: FamilyId): { key: string; ko: string; analogy: string }[] {
  return listNotes()
    .map((key) => ({ key, info: noteInfo(key)! }))
    .filter((n) => n.info.family === family)
    .sort((a, b) => b.info.total - a.info.total || a.key.localeCompare(b.key))
    .map((n) => ({ key: n.key, ko: n.info.ko, analogy: n.info.analogy }));
}

const weightOf = (note: string) => noteWeight(noteInfo(note)?.total ?? 100);

export type ExpertResult = { perfume: Perfume; match: Match };

export function searchExpert({ notes, layer, durations }: ExpertConditions): ExpertResult[] {
  if (!notes.length) return [];
  return listPerfumes()
    .filter((p) => !durations.length || durations.includes(durationOf(p.conc)?.band as DurationBand))
    .flatMap((perfume) => {
      const match = matchNotes(perfume, notes, layer, weightOf);
      return match ? [{ perfume, match }] : [];
    })
    .sort((a, b) => b.match.pct - a.match.pct || a.perfume.slug.localeCompare(b.perfume.slug));
}

/** 층은 전체로, 지속 시간 조건은 해제한다. 재료는 그대로 둔다. */
export function relaxConditions<T extends ExpertConditions>(q: T): T {
  return { ...q, layer: "any", durations: [] };
}

export function toExpertQuery(q: ExpertQuery): string {
  const p = new URLSearchParams();
  if (q.notes.length) p.set("notes", q.notes.join(","));
  if (q.layer !== "any") p.set("layer", q.layer);
  if (q.durations.length) p.set("dur", q.durations.join(","));
  p.set("fam", q.family);
  return p.toString();
}

export function parseExpertQuery(p: URLSearchParams): ExpertQuery {
  const notes = (p.get("notes") ?? "")
    .split(",")
    .filter((n, i, all) => noteInfo(n) && all.indexOf(n) === i)
    .slice(0, MAX_NOTES);
  const layer = LAYERS.find((l) => l === p.get("layer")) ?? "any";
  const bands = DURATION_BANDS.map((d) => d.band);
  const durations = (p.get("dur") ?? "").split(",").filter((b): b is DurationBand => bands.includes(b as DurationBand));
  const fam = FAMILIES.find((f) => f.id === p.get("fam"))?.id ?? DEFAULT_FAMILY;
  return { notes, layer, durations, family: fam };
}
