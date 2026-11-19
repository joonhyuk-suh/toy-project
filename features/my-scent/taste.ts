import type { Archive } from "@/features/archive";
import { plateNotes } from "@/features/food";
import { getPerfume, noteInfo } from "@/features/perfume";
import type { FamilyId } from "@/features/perfume";

export type TasteProfile = {
  topNotes: { note: string; count: number }[];
  families: { family: FamilyId; pct: number }[];
};

/**
 * 탐색 성향. 찾아본 음식·재료와 관심 향수의 핵심 재료에서 자주 나온 재료와 계열 비율.
 * 실제로 써 본 경험이 아니라 찾아본 기록 기준이다.
 */
export function tasteProfile({ history, wish }: Archive): TasteProfile {
  const counts = new Map<string, number>();
  const add = (note: string) => counts.set(note, (counts.get(note) ?? 0) + 1);
  for (const h of history) {
    if (h.kind === "food") {
      const { common, solo } = plateNotes(h.items);
      [...common, ...solo].forEach((n) => add(n.note));
    } else {
      h.items.forEach(add);
    }
  }
  for (const slug of wish) getPerfume(slug)?.sig.forEach(add);

  const topNotes = [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([note, count]) => ({ note, count }));

  const famCounts = new Map<FamilyId, number>();
  for (const [note, c] of counts) {
    const fam = noteInfo(note)?.family;
    if (fam) famCounts.set(fam, (famCounts.get(fam) ?? 0) + c);
  }
  const total = [...famCounts.values()].reduce((a, b) => a + b, 0);
  const families = [...famCounts]
    .sort((a, b) => b[1] - a[1])
    .map(([family, c]) => ({ family, pct: Math.round((c / total) * 100) }));
  return { topNotes, families };
}
