import { Share2, Sprout } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { RecordSearch, WishButton } from "@/features/archive";
import { FoodIcon, getFood, parseFoodIds, plateNotes, recommend } from "@/features/food";
import { SOURCE_LABEL } from "@/features/perfume";
import { PerfumeCard, noteKo } from "@/features/perfume/components";

export const metadata = { title: "추천 향수 목록 · 향 아카이브" };

export default async function ResultsPage({ searchParams }: PageProps<"/results">) {
  const sp = await searchParams;
  const ids = parseFoodIds(typeof sp.foods === "string" ? sp.foods : null);

  if (!ids.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sprout />
          </EmptyMedia>
          <EmptyTitle>고른 음식이 없어요</EmptyTitle>
          <EmptyDescription>음식을 골라야 어울리는 향수를 보여 드릴 수 있어요.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/food" className={buttonVariants()}>
            음식으로 찾아보기
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  const list = recommend(ids);
  const { common, solo } = plateNotes(ids);
  const foods = ids.map((id) => getFood(id)!);
  const here = `/results?foods=${ids.join(",")}`;

  return (
    <>
      <RecordSearch kind="food" items={ids} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Matched by taste</span>
          <h1 className="text-2xl sm:text-3xl">내 입맛 향수</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/food?foods=${ids.join(",")}`} className={buttonVariants({ variant: "outline" })}>
            음식 바꾸기
          </Link>
          <Link href={`/share?foods=${ids.join(",")}`} className={buttonVariants()}>
            <Share2 data-icon="inline-start" />
            결과 공유
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {foods.map((f) => (
          <span key={f.id} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-[13px]">
            <FoodIcon name={f.icon} className="size-3.5" />
            {f.name}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        재료 {common.length + solo.length}가지가 들어간 향수 {list.length}개를 찾았어요.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map(({ perfume, match }, i) => {
          const shown = match.hit.slice(0, 3).map((n) => {
            const names = match.foodsByNote[n].map((id) => getFood(id)!.name).join("·");
            return `${noteKo(n)}(${names})`;
          });
          const why = `겹치는 재료 · ${shown.join(", ")}${match.hit.length > 3 ? ` 외 ${match.hit.length - 3}개` : ""}`;
          return (
            <PerfumeCard
              key={perfume.slug}
              perfume={perfume}
              pct={match.pct}
              why={why}
              index={i}
              href={`/perfume/${perfume.slug}?from=${encodeURIComponent(here)}`}
              action={<WishButton slug={perfume.slug} />}
            />
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        궁합 점수는 고른 음식 중 몇 개가 이 향수와 이어지는지, 그리고 겹치는 재료가 얼마나 드문지로 계산해요.
      </p>
      <p className="text-center text-xs text-muted-foreground">향수 정보 출처: {SOURCE_LABEL}</p>
    </>
  );
}
