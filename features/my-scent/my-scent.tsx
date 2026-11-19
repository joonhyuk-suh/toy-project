"use client";

import { ChevronRight, FlaskConical, Coffee, Heart, Lock, Sprout } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { relativeTime, useArchive } from "@/features/archive";
import type { HistoryEntry } from "@/features/archive";
import { getFood } from "@/features/food";
import { FAMILIES, getPerfume, noteInfo } from "@/features/perfume";
import { PerfumeRow, noteColor, noteKo } from "@/features/perfume/components";

import { tasteProfile } from "./taste";

const noopSubscribe = () => () => {};
// 저장된 기록은 브라우저에만 있으므로 하이드레이션이 끝난 뒤에 그린다(빈 상태가 잠깐 비치지 않도록).
const useHydrated = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

function replayHref(h: HistoryEntry): string {
  if (h.kind === "food") return `/results?foods=${h.items.join(",")}`;
  const fam = noteInfo(h.items[0])?.family ?? "sweet";
  return `/expert?notes=${h.items.join(",")}&fam=${fam}`;
}

function historyTitle(h: HistoryEntry): string {
  return h.kind === "food"
    ? h.items.map((id) => getFood(id)?.name ?? id).join(" + ")
    : h.items.map(noteKo).join(" + ");
}

export function MyScent() {
  const hydrated = useHydrated();
  const { archive, toggleWish } = useArchive();
  const [now] = useState(() => Date.now());
  const empty = !archive.history.length && !archive.wish.length;
  if (!hydrated) return null;

  const taste = tasteProfile(archive);
  const max = taste.topNotes[0]?.count ?? 1;
  const wished = archive.wish.map((s) => getPerfume(s)).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">My scent</span>
        <h1 className="text-2xl sm:text-3xl">나의 향</h1>
        <p className="text-muted-foreground">지금까지 찾아본 기록으로 내가 끌리는 재료와 계열을 보여 드려요.</p>
      </div>
      <Alert>
        <Lock />
        <AlertDescription>
          로그인 전이라 기록과 관심 향수는 <b>이 브라우저에만</b> 저장돼요. 로그인 기능이 생기면 계정으로 옮길 수 있어요.
        </AlertDescription>
      </Alert>

      {empty ? (
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sprout />
              </EmptyMedia>
              <EmptyTitle>아직 찾아본 기록이 없어요</EmptyTitle>
              <EmptyDescription>음식을 고르거나 재료를 골라 향수를 찾아보면 여기에 나의 취향이 쌓여요.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/food" className={buttonVariants()}>
                음식으로 찾아보기
              </Link>
            </EmptyContent>
          </Empty>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <Card className="gap-3.5 px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">탐색 성향</h2>
              <Badge variant="secondary">찾아본 기록 기준</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              찾아본 음식·재료와 관심 향수에 자주 나온 재료예요. 실제로 써 본 경험과는 달라요.
            </p>
            {taste.topNotes.length ? (
              <>
                <ul className="flex flex-col gap-2.5">
                  {taste.topNotes.map(({ note, count }) => (
                    <li key={note} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span>
                          {noteKo(note)} <span className="text-muted-foreground">{noteInfo(note)?.analogy}</span>
                        </span>
                        <span className="text-muted-foreground">{count}회</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <i className="block h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: noteColor(note) }} />
                      </div>
                    </li>
                  ))}
                </ul>
                <Separator />
                <span className="text-xs text-muted-foreground">끌리는 계열</span>
                <div className="flex h-3.5 overflow-hidden rounded-full">
                  {taste.families.map((f) => (
                    <span key={f.family} style={{ flex: f.pct, background: FAMILIES.find((x) => x.id === f.family)!.color }} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {taste.families.slice(0, 4).map((f) => {
                    const fam = FAMILIES.find((x) => x.id === f.family)!;
                    return (
                      <span key={f.family} className="flex items-center gap-1">
                        <span className="size-2.5 rounded-full" style={{ background: fam.color }} />
                        {fam.ko} {f.pct}%
                      </span>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">기록이 쌓이면 자주 나온 재료가 여기에 보여요.</p>
            )}
          </Card>

          <Card className="gap-2 px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">최근에 찾은 것</h2>
              <span className="text-xs text-muted-foreground">{archive.history.length}개</span>
            </div>
            {archive.history.length ? (
              <ul>
                {archive.history.map((h) => (
                  <li key={`${h.kind}:${h.items.join(",")}`} className="relative flex items-center gap-3 border-b border-dashed py-2.5 last:border-b-0">
                    <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-secondary">
                      {h.kind === "food" ? <Coffee className="size-4" strokeWidth={1.3} /> : <FlaskConical className="size-4" strokeWidth={1.3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link href={replayHref(h)} className="block truncate after:absolute after:inset-0 after:content-['']">
                        {historyTitle(h)}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {h.kind === "food" ? "음식으로 찾기" : "전문가 모드"} · {relativeTime(h.at, now)}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">아직 기록이 없어요.</p>
            )}
          </Card>

          <Card className="gap-2 px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">관심 향수</h2>
              <span className="text-xs text-muted-foreground">{wished.length}개</span>
            </div>
            {wished.length ? (
              wished.map((p) => (
                <PerfumeRow
                  key={p.slug}
                  perfume={p}
                  href={`/perfume/${p.slug}?from=${encodeURIComponent("/me")}`}
                  sub={`${p.house} · ${p.notes.slice(0, 3).map(noteKo).join(" · ")}`}
                  end={
                    <Button size="icon-lg" aria-pressed aria-label="관심 향수에서 빼기" onClick={() => toggleWish(p.slug)}>
                      <Heart className="fill-current" />
                    </Button>
                  }
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground">하트를 누른 향수가 여기에 모여요.</p>
            )}
          </Card>

          <Card className="gap-2 bg-[repeating-linear-gradient(135deg,var(--card),var(--card)_10px,var(--secondary)_10px,var(--secondary)_20px)] px-4">
            <div className="flex items-center gap-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary">
                <Lock className="size-4" strokeWidth={1.3} />
              </span>
              <h2 className="text-xl">경험 분석</h2>
              <Badge variant="secondary">준비 중</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              향수를 실제로 쓰고 평가를 남기면, 내가 좋게 평가한 재료를 표로 모으고 그 재료의 느낌을 단어로 묶어 내 향 성향을
              분석해 드려요. 로그인과 사용 기록 기능이 생기면 열려요.
            </p>
          </Card>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">향수 정보 출처: Scento</p>
    </>
  );
}
