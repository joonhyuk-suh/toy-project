"use client";

import { Droplet, RotateCcw, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RecordSearch, WishButton } from "@/features/archive";
import { DURATION_BANDS, FAMILIES, durationOf, noteInfo } from "@/features/perfume";
import type { DurationBand, FamilyId, LayerFilter } from "@/features/perfume";
import { PerfumeCard, noteColor, noteKo } from "@/features/perfume/components";
import { cn } from "@/lib/utils";

import { MAX_NOTES, notesOfFamily, parseExpertQuery, relaxConditions, searchExpert, toExpertQuery, toggleNote } from "./search";
import type { ExpertQuery } from "./search";
import { ScentWheel } from "./scent-wheel";

const LAYERS: { value: LayerFilter; label: string }[] = [
  { value: "any", label: "전체" },
  { value: "top", label: "처음 향 · 뿌린 직후" },
  { value: "heart", label: "중간 향 · 1시간 뒤" },
  { value: "base", label: "잔향 · 저녁까지" },
];

const segment = "h-auto justify-start rounded-[10px] px-3 py-2 text-[12.5px] aria-pressed:bg-primary aria-pressed:text-primary-foreground";

/** 전문가 모드: 향 계열 휠 → 재료 체크 → 층·지속 시간 조건. 바꿀 때마다 결과가 바로 바뀐다. */
export function ExpertFinder() {
  const params = useSearchParams();
  const [q, setQ] = useState<ExpertQuery>(() => parseExpertQuery(new URLSearchParams(params.toString())));

  function update(next: ExpertQuery) {
    setQ(next);
    window.history.replaceState(null, "", `/expert?${toExpertQuery(next)}`);
  }

  const notes = useMemo(() => notesOfFamily(q.family), [q.family]);
  const results = useMemo(() => searchExpert(q), [q]);
  const family = FAMILIES.find((f) => f.id === q.family)!;
  const full = q.notes.length >= MAX_NOTES;
  const countByFamily = useMemo(() => {
    const m: Partial<Record<FamilyId, number>> = {};
    for (const n of q.notes) {
      const f = noteInfo(n)?.family;
      if (f) m[f] = (m[f] ?? 0) + 1;
    }
    return m;
  }, [q.notes]);
  const here = `/expert?${toExpertQuery(q)}`;
  const empty = q.notes.length > 0 && results.length === 0;

  return (
    <>
      <RecordSearch kind="expert" items={q.notes} />
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Pro mode</span>
          <h1 className="text-2xl sm:text-3xl">재료로 직접 찾기</h1>
        </div>
        <Button variant="ghost" onClick={() => update({ notes: [], layer: "any", durations: [], family: q.family })}>
          <RotateCcw data-icon="inline-start" />
          초기화
        </Button>
      </div>

      <div className="grid gap-4 min-[1000px]:grid-cols-[340px_minmax(0,1fr)_240px] min-[1000px]:items-start">
        <Card className="items-center px-4">
          <p className="self-start text-xs text-muted-foreground">1. 향 계열 휠에서 끌리는 영역을 누르세요</p>
          <ScentWheel
            selected={q.family}
            counts={countByFamily}
            noteCount={notes.length}
            onSelect={(family) => update({ ...q, family })}
          />
        </Card>

        <Card className="px-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">2. 원하는 재료를 체크하세요</p>
            <span className="text-xs">
              {q.notes.length}/{MAX_NOTES}
            </span>
          </div>
          <h3 className="flex items-center gap-2 text-base">
            <span className="size-2.5 rounded-full" style={{ background: family.color }} />
            {family.ko} 계열
          </h3>
          <ul className="grid max-h-[360px] gap-x-3 gap-y-1 overflow-y-auto sm:grid-cols-2">
            {notes.map((n) => {
              const on = q.notes.includes(n.key);
              const disabled = !on && full;
              return (
                <li key={n.key}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-[10px] px-1.5 py-2 hover:bg-secondary",
                      disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                    )}
                  >
                    <Checkbox
                      checked={on}
                      disabled={disabled}
                      onCheckedChange={() => update({ ...q, notes: toggleNote(q.notes, n.key) })}
                    />
                    <span className="flex flex-col">
                      <span>{n.ko}</span>
                      <span className="text-[11px] text-muted-foreground">{n.analogy}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          {full ? (
            <p className="text-xs text-muted-foreground">재료는 최대 4개까지 고를 수 있어요. 하나를 해제하고 골라 주세요.</p>
          ) : null}
          <Separator />
          <div className="flex flex-wrap gap-2">
            {q.notes.length ? (
              q.notes.map((n) => (
                <Button
                  key={n}
                  variant="outline"
                  size="sm"
                  aria-label={`${noteKo(n)} 빼기`}
                  className="border-transparent text-(--fam-ink) hover:text-(--fam-ink)"
                  style={{ background: noteColor(n) }}
                  onClick={() => update({ ...q, notes: q.notes.filter((x) => x !== n) })}
                >
                  {noteKo(n)}
                  <X data-icon="inline-end" />
                </Button>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">고른 재료가 여기에 모여요</span>
            )}
          </div>
        </Card>

        <Card className="px-4">
          <p className="text-xs text-muted-foreground">3. 조건 더하기</p>
          <h3 className="text-sm">재료가 들어간 층</h3>
          <ToggleGroup
            value={[q.layer]}
            onValueChange={(v) => v[0] && update({ ...q, layer: v[0] as LayerFilter })}
            variant="outline"
            orientation="vertical"
            spacing={1}
            className="w-full min-[1000px]:flex-col max-[999px]:flex-row max-[999px]:flex-wrap"
            aria-label="재료가 들어간 층"
          >
            {LAYERS.map((l) => (
              <ToggleGroupItem key={l.value} value={l.value} className={segment}>
                {l.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <h3 className="mt-1.5 text-sm">
            지속 시간 <span className="font-sans text-xs font-normal text-muted-foreground">농도 기준 추정</span>
          </h3>
          <ToggleGroup
            multiple
            value={q.durations}
            onValueChange={(v) => update({ ...q, durations: v as DurationBand[] })}
            variant="outline"
            orientation="vertical"
            spacing={1}
            className="w-full min-[1000px]:flex-col max-[999px]:flex-row max-[999px]:flex-wrap"
            aria-label="지속 시간"
          >
            {DURATION_BANDS.map((d) => (
              <ToggleGroupItem key={d.band} value={d.band} className={segment}>
                {d.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Card>
      </div>

      <div className="flex items-baseline justify-between">
        <h2 className="text-xl">{q.notes.length ? `향수 ${results.length}개` : "재료를 골라 주세요"}</h2>
        <span className="text-xs text-muted-foreground">궁합 점수 순</span>
      </div>

      {empty ? (
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Droplet />
              </EmptyMedia>
              <EmptyTitle>조건에 맞는 향수가 없어요</EmptyTitle>
              <EmptyDescription>재료를 하나 빼거나 층과 지속 시간 조건을 풀어 보세요.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => update(relaxConditions(q))}>
                층·지속 시간 조건 풀기
              </Button>
            </EmptyContent>
          </Empty>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map(({ perfume, match }, i) => {
            const d = durationOf(perfume.conc);
            const why = `${match.hit.map(noteKo).join(", ")} · ${d ? `${d.label} ${d.hours}` : "농도 정보 없음"}`;
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
      )}
      <p className="text-center text-xs text-muted-foreground">향수 정보 출처: Scento</p>
    </>
  );
}
