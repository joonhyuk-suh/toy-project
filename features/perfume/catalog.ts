import seed from "./data/seed.json";
import type { Concentration, DurationBand, FamilyId, NoteInfo, Perfume, Pyramid } from "./types";

/** 향 계열 휠 순서(위에서 시계 방향). 색은 globals.css의 --fam-* 토큰이다. */
export const FAMILIES: { id: FamilyId; ko: string; color: string }[] = [
  { id: "citrus", ko: "시트러스", color: "var(--fam-citrus)" },
  { id: "green", ko: "그린·차", color: "var(--fam-green)" },
  { id: "fruit", ko: "과일", color: "var(--fam-fruit)" },
  { id: "floral", ko: "꽃", color: "var(--fam-floral)" },
  { id: "white", ko: "하얀 꽃", color: "var(--fam-white)" },
  { id: "powder", ko: "파우더리", color: "var(--fam-powder)" },
  { id: "musk", ko: "살냄새", color: "var(--fam-musk)" },
  { id: "sweet", ko: "달콤함", color: "var(--fam-sweet)" },
  { id: "amber", ko: "앰버", color: "var(--fam-amber)" },
  { id: "spice", ko: "스파이스", color: "var(--fam-spice)" },
  { id: "smoke", ko: "스모키", color: "var(--fam-smoke)" },
  { id: "wood", ko: "우디", color: "var(--fam-wood)" },
];

export const SOURCE_LABEL = "Scento";

type SeedPerfume = Omit<Perfume, "notes" | "pyramid" | "conc"> & {
  conc: Concentration | null;
  pyramid: Pyramid | null;
  notes?: string[];
};

const PERFUMES: Perfume[] = (seed.perfumes as unknown as SeedPerfume[]).map((p) => ({
  ...p,
  notes: p.pyramid ? [...new Set([...p.pyramid.top, ...p.pyramid.heart, ...p.pyramid.base])] : (p.notes ?? []),
}));
const BY_SLUG = new Map(PERFUMES.map((p) => [p.slug, p]));
const NOTES = seed.notes as Record<string, NoteInfo>;

export function listPerfumes(): Perfume[] {
  return PERFUMES;
}

export function getPerfume(slug: string): Perfume | undefined {
  return BY_SLUG.get(slug);
}

export function noteInfo(key: string): NoteInfo | undefined {
  return NOTES[key];
}

export function listNotes(): string[] {
  return Object.keys(NOTES);
}

const DURATIONS: Record<Concentration, { band: DurationBand; hours: string; label: string }> = {
  edc: { band: "short", hours: "1–2시간", label: "오 드 코롱" },
  edt: { band: "mid", hours: "3–4시간", label: "오 드 뚜왈렛" },
  edp: { band: "long", hours: "5–6시간", label: "오 드 퍼퓸" },
  parfum: { band: "xlong", hours: "7시간 이상", label: "퍼퓸" },
  extrait: { band: "xlong", hours: "7시간 이상", label: "엑스트레 드 퍼퓸" },
  elixir: { band: "xlong", hours: "7시간 이상", label: "엘릭서" },
};

/** 향수 농도에서 지속 시간을 추정한다. 농도 정보가 없으면 null. */
export function durationOf(conc: Concentration | null) {
  return conc ? DURATIONS[conc] : null;
}

export const DURATION_BANDS: { band: DurationBand; label: string }[] = [
  { band: "short", label: "짧음 1–2시간" },
  { band: "mid", label: "중간 3–4시간" },
  { band: "long", label: "김 5–6시간" },
  { band: "xlong", label: "매우 김 7시간+" },
];

/** 겹치는 재료 수와 같은 계열 여부로 비슷한 향수를 고른다. 동점이면 슬러그 순. */
export function findSimilar(p: Perfume, count: number): Perfume[] {
  const mine = new Set(p.notes);
  return PERFUMES.filter((o) => o.slug !== p.slug)
    .map((o) => ({ o, k: o.notes.filter((n) => mine.has(n)).length + (o.family === p.family ? 1 : 0) }))
    .sort((a, b) => b.k - a.k || a.o.slug.localeCompare(b.o.slug))
    .slice(0, count)
    .map((x) => x.o);
}
