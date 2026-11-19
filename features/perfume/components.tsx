import { Candy, Citrus, Cherry, Droplet, Feather, Flame, Flower2, Leaf, Sun, TreeDeciduous } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { FAMILIES, noteInfo } from "./catalog";
import type { FamilyId, Perfume } from "./types";

const FAMILY_ICON: Record<FamilyId, LucideIcon> = {
  citrus: Citrus,
  fruit: Cherry,
  green: Leaf,
  floral: Flower2,
  white: Flower2,
  powder: Feather,
  musk: Droplet,
  sweet: Candy,
  amber: Sun,
  spice: Flame,
  smoke: Flame,
  wood: TreeDeciduous,
};

export const familyInfo = (id: FamilyId) => FAMILIES.find((f) => f.id === id)!;
export const noteKo = (key: string) => noteInfo(key)?.ko ?? key;
export const noteColor = (key: string) => familyInfo(noteInfo(key)?.family ?? "sweet").color;

/** 계열 색 원 위에 얇은 선 아이콘을 올린다. 크기는 className으로 정한다. */
export function FamilyOrb({
  family,
  className,
  style,
  children,
}: {
  family: FamilyId;
  className?: string;
  style?: React.CSSProperties;
  /** 계열 아이콘 대신 올릴 아이콘(예: 음식 아이콘) */
  children?: React.ReactNode;
}) {
  const Icon = FAMILY_ICON[family];
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full text-(--fam-ink)", className)}
      style={{ ...style, background: familyInfo(family).color }}
    >
      {children ?? <Icon className="size-[55%]" strokeWidth={1.2} aria-hidden />}
    </span>
  );
}

export function NoteOrb({ note, className }: { note: string; className?: string }) {
  return <FamilyOrb family={noteInfo(note)?.family ?? "sweet"} className={className} />;
}

export function FamilyBadge({ family }: { family: FamilyId }) {
  const f = familyInfo(family);
  return (
    <Badge className="border-transparent text-(--fam-ink)" style={{ background: f.color }}>
      {f.ko}
    </Badge>
  );
}

/** 층마다 그 층 첫 재료의 계열 색으로 채운 작은 향수병. 층 정보가 없으면 한 층. */
export function MiniBottle({ perfume }: { perfume: Perfume }) {
  const layers = perfume.pyramid
    ? [perfume.pyramid.base, perfume.pyramid.heart, perfume.pyramid.top].filter((l) => l.length)
    : [perfume.notes];
  return (
    <span
      aria-hidden
      className="flex h-[42px] w-[30px] shrink-0 flex-col-reverse overflow-hidden rounded-t-lg rounded-b-[10px] border"
    >
      {layers.map((l, i) => (
        <span key={i} className="flex-1" style={{ background: noteColor(l[0]) }} />
      ))}
    </span>
  );
}

const CIRC = 2 * Math.PI * 23;

export function ScoreRing({ pct }: { pct: number }) {
  return (
    <span className="relative size-[54px] shrink-0" role="img" aria-label={`궁합 ${pct}%`}>
      <svg viewBox="0 0 54 54" className="size-[54px] -rotate-90" aria-hidden>
        <circle cx="27" cy="27" r="23" fill="none" stroke="var(--muted)" strokeWidth="4" />
        <circle
          cx="27"
          cy="27"
          r="23"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - pct / 100)}
          className="ring-fill"
          style={{ "--ring-full": CIRC } as React.CSSProperties}
        />
      </svg>
      <b className="absolute inset-0 grid place-items-center text-xs font-medium">{pct}%</b>
    </span>
  );
}

/**
 * 추천 향수 한 줄. 카드 전체가 상세로 가는 링크이고, 하트 같은 동작은 action 자리에 올린다.
 * 조합은 상위(화면)가 한다. 이 카드는 관심 향수 저장소를 모른다.
 */
export function PerfumeCard({
  perfume,
  pct,
  why,
  href,
  action,
  index = 0,
}: {
  perfume: Perfume;
  pct: number;
  why: string;
  href: string;
  action?: React.ReactNode;
  index?: number;
}) {
  return (
    <Card
      className="pop relative flex-row items-center gap-3.5 px-4 py-4 transition-colors hover:bg-secondary/40"
      style={{ "--i": Math.min(index, 12) } as React.CSSProperties}
    >
      <ScoreRing pct={pct} />
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className="block font-latin text-lg leading-tight after:absolute after:inset-0 after:content-['']"
        >
          {perfume.name}
        </Link>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {perfume.house}
          <FamilyBadge family={perfume.family} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{why}</p>
      </div>
      {action ? <div className="relative z-10">{action}</div> : null}
    </Card>
  );
}

/** 작은 목록 줄: 향수병, 이름, 브랜드 + 오른쪽 자리. */
export function PerfumeRow({
  perfume,
  href,
  sub,
  end,
}: {
  perfume: Perfume;
  href: string;
  sub?: string;
  end?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center gap-2.5 border-b border-dashed py-2 last:border-b-0">
      <MiniBottle perfume={perfume} />
      <div className="min-w-0 flex-1">
        <Link href={href} className="block truncate font-latin text-base after:absolute after:inset-0 after:content-['']">
          {perfume.name}
        </Link>
        <div className="truncate text-xs text-muted-foreground">{sub ?? perfume.house}</div>
      </div>
      {end ? <div className="relative z-10">{end}</div> : null}
    </div>
  );
}
