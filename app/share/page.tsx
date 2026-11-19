import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getFood, parseFoodIds, personaOf, recommend } from "@/features/food";
import { SOURCE_LABEL } from "@/features/perfume";
import { noteKo } from "@/features/perfume/components";
import { ShareActions, ShareCard } from "@/features/share";
import { cn } from "@/lib/utils";

export const metadata = { title: "결과 공유 · 향 아카이브" };

export default async function SharePage({ searchParams }: PageProps<"/share">) {
  const sp = await searchParams;
  const ids = parseFoodIds(typeof sp.foods === "string" ? sp.foods : null);
  const received = sp.view === "received";

  if (!ids.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <h1 className="text-2xl">공유할 결과가 없어요</h1>
        <p className="text-muted-foreground">음식을 골라 나만의 입맛 향수를 만들어 보세요.</p>
        <Link href="/food" className={buttonVariants({ size: "lg" })}>
          나도 내 입맛 향수 찾기
        </Link>
      </div>
    );
  }

  const list = recommend(ids);
  const top = list[0];
  const family = top ? top.perfume.family : "sweet";
  const persona = personaOf(family);
  const topData = top
    ? { name: top.perfume.name, house: top.perfume.house, pct: top.match.pct, hit: top.match.hit }
    : null;
  const others = Math.max(0, list.length - 1);
  const foodsParam = ids.join(",");

  return (
    <>
      {received ? null : (
        <div>
          <Link href={`/results?foods=${foodsParam}`} className={buttonVariants({ variant: "ghost" })}>
            <ChevronLeft data-icon="inline-start" />
            결과로
          </Link>
        </div>
      )}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl sm:text-3xl">{received ? "친구의 입맛 향수" : "내 입맛 향수 공유"}</h1>
        {received ? <p className="text-xs text-muted-foreground">친구가 자기 입맛 향수를 보냈어요.</p> : null}
      </div>
      <ShareCard family={family} persona={persona} foodIds={ids} received={received} top={topData} others={others} />
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-2.5">
        {received ? (
          <>
            <Link href="/food" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              나도 내 입맛 향수 찾기
            </Link>
            <Link href={`/results?foods=${foodsParam}`} className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full")}>
              이 조합의 향수 전체 보기
            </Link>
          </>
        ) : (
          <>
            <ShareActions
              foods={ids}
              card={{
                family,
                persona,
                foodNames: ids.map((id) => getFood(id)!.name),
                top: topData ? { ...topData, hit: topData.hit.map(noteKo) } : null,
                others,
              }}
            />
            <p className="text-center text-xs text-muted-foreground">
              링크를 받은 사람은 같은 조합의 결과를 보고 바로 자기 것도 만들어 볼 수 있어요.
            </p>
          </>
        )}
        <p className="text-center text-xs text-muted-foreground">향수 정보 출처: {SOURCE_LABEL}</p>
      </div>
    </>
  );
}
