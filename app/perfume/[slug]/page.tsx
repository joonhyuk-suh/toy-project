import { ChevronLeft, Clock3, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WishButton } from "@/features/archive";
import { SOURCE_LABEL, durationOf, findSimilar, getPerfume, noteInfo } from "@/features/perfume";
import type { Perfume } from "@/features/perfume";
import { FamilyBadge, NoteOrb, PerfumeRow, noteColor } from "@/features/perfume/components";

const LAYER_LABEL = { top: "처음 향", heart: "중간 향", base: "잔향" } as const;

const BACK_LABEL: [string, string][] = [
  ["/results", "추천 목록으로"],
  ["/expert", "전문가 모드로"],
  ["/me", "나의 향으로"],
  ["/food", "음식 고르기로"],
];

// 상세를 연 곳(from)만 돌아갈 곳으로 받아들인다. 앱 안의 알려진 화면이 아니면 추천 목록 없이 홈으로 간다.
function backTarget(from: string | undefined): { href: string; label: string } {
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    const hit = BACK_LABEL.find(([prefix]) => from === prefix || from.startsWith(`${prefix}?`));
    if (hit) return { href: from, label: hit[1] };
  }
  return { href: "/", label: "홈으로" };
}

export async function generateMetadata({ params }: PageProps<"/perfume/[slug]">) {
  const p = getPerfume((await params).slug);
  return { title: p ? `${p.name} · 향 아카이브` : "향수 상세 · 향 아카이브" };
}

export default async function PerfumePage({ params, searchParams }: PageProps<"/perfume/[slug]">) {
  const perfume = getPerfume((await params).slug);
  if (!perfume) notFound();
  const sp = await searchParams;
  const from = typeof sp.from === "string" ? sp.from : undefined;
  const back = backTarget(from);
  const similar = findSimilar(perfume, 3);
  const duration = durationOf(perfume.conc);

  const layers = perfume.pyramid
    ? (["base", "heart", "top"] as const).filter((l) => perfume.pyramid![l].length).map((l) => ({ label: LAYER_LABEL[l], first: perfume.pyramid![l][0] }))
    : [{ label: "전체", first: perfume.notes[0] }];
  const recipe: { layer: string; note: string }[] = perfume.pyramid
    ? (["top", "heart", "base"] as const).flatMap((l) => perfume.pyramid![l].map((note) => ({ layer: LAYER_LABEL[l], note })))
    : perfume.notes.map((note) => ({ layer: "", note }));

  return (
    <>
      <div>
        <Link href={back.href} className={buttonVariants({ variant: "ghost" })}>
          <ChevronLeft data-icon="inline-start" />
          {back.label}
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1.35fr)_minmax(300px,1fr)] sm:items-start">
        <div className="flex flex-col gap-4">
          <Card className="items-center gap-2.5 px-4 text-center">
            <div className="flex flex-col items-center py-2.5" aria-hidden>
              <div className="h-[22px] w-[46px] rounded-t-md rounded-b-xs bg-(--fam-ink) opacity-85" />
              <div className="h-2.5 w-[26px] bg-border" />
              <div className="flex h-[190px] w-[150px] flex-col-reverse overflow-hidden rounded-t-[22px] rounded-b-[30px] border-[1.5px] border-ring bg-card">
                {layers.map((l, i) => (
                  <div
                    key={l.label}
                    className="bottle-layer grid flex-1 place-items-center text-[11px] text-(--fam-ink)"
                    style={{ "--i": i, background: noteColor(l.first) } as React.CSSProperties}
                  >
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
            <h1 className="font-latin text-3xl leading-tight font-normal">{perfume.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
              {perfume.house}
              <FamilyBadge family={perfume.family} />
              {duration ? <Badge variant="secondary">{duration.label}</Badge> : null}
            </div>
            <p className="max-w-sm">{perfume.line}</p>
            <WishButton slug={perfume.slug} variant="full" />
          </Card>
          <Card className="gap-3 px-4">
            <Fact icon={<Sun />} label="어울리는 계절" value={perfume.seasons.join(" · ") || "정보 없음"} />
            <Fact icon={<Moon />} label="어울리는 시간" value={perfume.hours.join(" · ") || "정보 없음"} />
            <Fact
              icon={<Clock3 />}
              label="예상 지속 시간"
              value={
                duration ? (
                  <>
                    {duration.hours} <span className="text-xs text-muted-foreground">농도 기준 추정</span>
                  </>
                ) : (
                  "농도 정보 없음"
                )
              }
            />
            {perfume.words.length ? (
              <>
                <Separator />
                <div className="flex flex-wrap gap-1.5">
                  {perfume.words.map((w) => (
                    <Badge key={w} variant="secondary">
                      #{w}
                    </Badge>
                  ))}
                </div>
              </>
            ) : null}
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card className="px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">향 레시피</h2>
              <span className="text-xs text-muted-foreground">{perfume.pyramid ? "뿌린 뒤 시간 순서" : "들어간 재료"}</span>
            </div>
            {perfume.pyramid ? null : (
              <p className="text-xs text-muted-foreground">
                이 향수는 처음·중간·잔향 구분 정보가 없어서 들어간 재료만 보여 드려요.
              </p>
            )}
            <ul>
              {recipe.map(({ layer, note }, i) => (
                <li key={`${layer}-${note}-${i}`} className="flex items-center gap-3 border-b border-dashed py-2.5 last:border-b-0">
                  {layer ? <span className="min-w-12 text-[10.5px] text-muted-foreground">{layer}</span> : null}
                  <NoteOrb note={note} className="size-[30px]" />
                  <span className="flex-1">
                    <b className="font-medium">{noteInfo(note)?.ko}</b>
                    <br />
                    <span className="text-xs text-muted-foreground">{noteInfo(note)?.analogy}</span>
                  </span>
                  {perfume.sig.includes(note) ? <Badge variant="secondary">핵심</Badge> : null}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="gap-1.5 px-4">
            <h3 className="text-base">비슷한 향수</h3>
            {similar.map((o: Perfume) => (
              <PerfumeRow
                key={o.slug}
                perfume={o}
                href={`/perfume/${o.slug}${from ? `?from=${encodeURIComponent(from)}` : ""}`}
                end={<FamilyBadge family={o.family} />}
              />
            ))}
          </Card>
          <p className="text-center text-xs text-muted-foreground">향수 정보 출처: {SOURCE_LABEL}</p>
        </div>
      </div>
    </>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-4">
        {icon}
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
