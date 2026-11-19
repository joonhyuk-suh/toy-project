import { FoodIcon, getFood } from "@/features/food";
import type { FamilyId } from "@/features/perfume";
import { familyInfo, noteKo } from "@/features/perfume/components";

import { Badge } from "@/components/ui/badge";

/** 결과 공유 카드. 1위 향수의 계열 색으로 칠한다. */
export function ShareCard({
  family,
  persona,
  foodIds,
  received,
  top,
  others,
}: {
  family: FamilyId;
  persona: string;
  foodIds: string[];
  received: boolean;
  top: { name: string; house: string; pct: number; hit: string[] } | null;
  others: number;
}) {
  const foods = foodIds.map((id) => getFood(id)!);
  return (
    <div
      className="relative mx-auto flex w-full max-w-[420px] flex-col gap-3.5 overflow-hidden rounded-3xl p-6 text-(--fam-ink)"
      style={{ background: familyInfo(family).color }}
      data-testid="share-card"
    >
      <span aria-hidden className="absolute -top-14 -right-12 size-[180px] rounded-full bg-(--fam-floral) opacity-45 mix-blend-multiply" />
      <span aria-hidden className="absolute -bottom-10 -left-10 size-[120px] rounded-full bg-(--fam-green) opacity-45 mix-blend-multiply" />
      <span className="relative text-[11px] tracking-[0.18em] text-(--fam-ink)/80 uppercase">
        {received ? "친구의" : "나의"} 입맛 향수 유형
      </span>
      <div className="relative font-heading text-[28px] leading-tight">{persona}</div>
      <div className="relative flex flex-wrap gap-2" aria-hidden>
        {foods.map((f) => (
          <span key={f.id} className="grid size-10 place-items-center rounded-full bg-[rgb(255_252_247/0.75)]">
            <FoodIcon name={f.icon} className="size-5" />
          </span>
        ))}
      </div>
      <div className="relative text-xs">{foods.map((f) => f.name).join(" + ")}</div>
      {top ? (
        <div className="relative flex flex-col gap-1 rounded-2xl bg-[rgb(255_252_247/0.72)] p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-75">가장 잘 맞는 향수</span>
            <b>{top.pct}%</b>
          </div>
          <div className="font-latin text-2xl leading-tight">{top.name}</div>
          <div className="text-xs">{top.house}</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {top.hit.map((n) => (
              <Badge key={n} className="border-transparent bg-white/80 text-(--fam-ink)">
                {noteKo(n)}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
      <div className="relative text-xs opacity-70">함께 맞은 향수 {others}개 · 향 아카이브</div>
    </div>
  );
}
