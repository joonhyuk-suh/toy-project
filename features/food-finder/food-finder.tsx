"use client";

import { Search, Sprout, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CATEGORIES,
  FOODS,
  FoodIcon,
  MAX_PICK,
  filterFoods,
  foodFamily,
  getFood,
  parseFoodIds,
  plateNotes,
  recommend,
  togglePick,
} from "@/features/food";
import type { CategoryFilter } from "@/features/food";
import { FamilyOrb, PerfumeRow, noteColor, noteKo } from "@/features/perfume/components";
import { noteInfo } from "@/features/perfume";
import { cn } from "@/lib/utils";

function NotePill({ note, count, common }: { note: string; count?: number; common?: boolean }) {
  return (
    <span
      className={cn(
        "pop inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] text-(--fam-ink)",
        common && "ring-[1.5px] ring-(--fam-ink) ring-inset",
      )}
      style={{ background: noteColor(note) }}
    >
      {noteKo(note)}
      {count ? <small className="opacity-70">{count}개 음식</small> : null}
      {!common ? <small className="opacity-70">{noteInfo(note)?.analogy}</small> : null}
    </span>
  );
}

const resultsHref = (ids: string[]) => `/results?foods=${ids.join(",")}`;

/** 음식으로 찾기: 한 화면에서 음식을 고르면 공통 재료와 추천 향수 미리 보기가 바로 바뀐다. */
export function FoodFinder() {
  const initial = parseFoodIds(useSearchParams().get("foods"));
  const [picked, setPicked] = useState<string[]>(initial);
  const [category, setCategory] = useState<CategoryFilter>("전체");
  const [query, setQuery] = useState("");

  const list = useMemo(() => filterFoods({ category, query }), [category, query]);
  const { common, solo } = useMemo(() => plateNotes(picked), [picked]);
  const results = useMemo(() => recommend(picked), [picked]);
  const full = picked.length >= MAX_PICK;

  function toggle(id: string) {
    const next = togglePick(picked, id);
    setPicked(next);
    // 새로 고쳐도, 결과에서 "음식 바꾸기"로 돌아와도 고른 음식이 남도록 주소에 반영한다.
    window.history.replaceState(null, "", next.length ? `/food?foods=${next.join(",")}` : "/food");
    if (query && !filterFoods({ category, query }).length) setQuery("");
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1.35fr)_minmax(300px,1fr)] sm:items-start">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl">좋아하는 음식 고르기</h1>
            <p className="text-muted-foreground">
              끌리는 음식을 1–5개 골라 보세요. 고르는 즉시 공통 재료와 어울리는 향수가 나타나요.
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) setCategory("전체");
              }}
              placeholder="음식 이름으로 찾기 (예: 라떼, 타르트)"
              aria-label="음식 이름으로 찾기"
              autoComplete="off"
              className="h-11 rounded-full pl-10"
            />
          </div>

          <ToggleGroup
            value={[category]}
            onValueChange={(v) => v[0] && setCategory(v[0] as CategoryFilter)}
            variant="outline"
            className="flex-wrap"
            aria-label="음식 카테고리"
          >
            {CATEGORIES.map((c) => (
              <ToggleGroupItem
                key={c}
                value={c}
                className="h-9 rounded-full px-3.5 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              >
                {c}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {list.length ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2.5">
              {list.map((f) => {
                const on = picked.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={on}
                    disabled={!on && full}
                    onClick={() => toggle(f.id)}
                    className="relative flex flex-col items-center gap-1.5 rounded-2xl border bg-card px-1.5 pt-3.5 pb-2.5 text-center transition outline-none hover:-translate-y-px focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-35 aria-pressed:border-primary aria-pressed:ring-1 aria-pressed:ring-primary"
                  >
                    <FamilyOrb family={foodFamily(f)} className="size-[46px]">
                      <FoodIcon name={f.icon} className="size-[22px]" />
                    </FamilyOrb>
                    {on ? (
                      <span className="absolute top-2 right-2 grid size-[18px] place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {picked.indexOf(f.id) + 1}
                      </span>
                    ) : null}
                    <span className="text-[13px]">{f.name}</span>
                    <span className="text-[10.5px] leading-snug text-muted-foreground">
                      {f.ingredients.filter((i) => i.note).map((i) => i.name).join(" · ")}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <Card>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search />
                  </EmptyMedia>
                  <EmptyTitle>&apos;{query}&apos;은(는) 아직 정리되지 않은 음식이에요</EmptyTitle>
                  <EmptyDescription>재료를 하나씩 정리한 음식만 고를 수 있어요. 비슷한 음식으로 시작해 보세요.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <div className="flex flex-wrap justify-center gap-2">
                    {FOODS.slice(0, 3).map((f) => (
                      <Button key={f.id} variant="outline" size="sm" onClick={() => toggle(f.id)}>
                        <FoodIcon name={f.icon} />
                        {f.name}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => toast.add({ title: "요청을 보냈어요. 정리되면 목록에 추가할게요", type: "success" })}
                  >
                    이 음식 추가 요청하기
                  </Button>
                </EmptyContent>
              </Empty>
            </Card>
          )}
        </div>

        <aside className="flex flex-col gap-3 sm:sticky sm:top-4" aria-label="내가 고른 음식과 공통 재료">
          {!picked.length ? (
            <Card>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Sprout />
                  </EmptyMedia>
                  <EmptyTitle>음식을 고르면 여기에 공통 재료가 나타나요</EmptyTitle>
                  <EmptyDescription>하나만 골라도 바로 어울리는 향수를 보여 드려요.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Card>
          ) : (
            <>
              <Card className="gap-3.5 px-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">My plate</span>
                  <span className="text-xs text-muted-foreground">
                    {picked.length}/{MAX_PICK}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {picked.map((id) => {
                    const f = getFood(id)!;
                    return (
                      <Button key={id} variant="outline" size="sm" aria-label={`${f.name} 빼기`} onClick={() => toggle(id)}>
                        <FoodIcon name={f.icon} />
                        {f.name}
                        <X data-icon="inline-end" />
                      </Button>
                    );
                  })}
                </div>
                <Separator />
                {common.length ? (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base">함께 들어 있는 재료</h3>
                    <div className="flex flex-wrap gap-2">
                      {common.map((c) => (
                        <NotePill key={c.note} note={c.note} count={c.foods.length} common />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    아직 겹치는 재료는 없어요. 음식을 하나 더 고르면 겹치는 재료가 생길 수 있어요.
                  </p>
                )}
                {solo.length ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">그 밖의 재료</span>
                    <div className="flex flex-wrap gap-2">
                      {solo.map((c) => (
                        <NotePill key={c.note} note={c.note} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </Card>
              <Card className="gap-1.5 px-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base">잘 맞는 향수 미리 보기</h3>
                  <span className="text-xs text-muted-foreground">{results.length}개</span>
                </div>
                {results.slice(0, 3).map(({ perfume, match }) => (
                  <PerfumeRow
                    key={perfume.slug}
                    perfume={perfume}
                    href={`/perfume/${perfume.slug}?from=${encodeURIComponent(`/food?foods=${picked.join(",")}`)}`}
                    end={<b className="text-xs">{match.pct}%</b>}
                  />
                ))}
                {!results.length ? <p className="text-xs text-muted-foreground">이 재료가 든 향수가 아직 적어요.</p> : null}
                <Link href={resultsHref(picked)} className={cn(buttonVariants({ size: "lg" }), "mt-1.5 w-full")}>
                  추천 향수 전체 보기
                </Link>
              </Card>
            </>
          )}
        </aside>
      </div>

      {picked.length ? (
        <div className="fixed inset-x-3 bottom-[68px] z-30 flex items-center gap-2.5 rounded-2xl bg-primary py-2.5 pr-2.5 pl-3.5 text-primary-foreground shadow-lg sm:hidden">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs opacity-75">{common.length ? "함께 들어 있는 재료" : "고른 음식의 재료"}</span>
            <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
              {(common.length ? common : [...common, ...solo]).map((c) => (
                <span
                  key={c.note}
                  className="rounded-full px-2.5 py-1 text-[11.5px] whitespace-nowrap text-(--fam-ink)"
                  style={{ background: noteColor(c.note) }}
                >
                  {noteKo(c.note)}
                </span>
              ))}
            </div>
          </div>
          <Link href={resultsHref(picked)} className={cn(buttonVariants({ variant: "secondary" }), "h-9 px-3")}>
            향수 {results.length}개
          </Link>
        </div>
      ) : null}
    </>
  );
}
