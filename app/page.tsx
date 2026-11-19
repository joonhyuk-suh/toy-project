import { Citrus, Coffee, ChevronRight, FlaskConical, Flower2, Leaf } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FoodIcon, PRESETS, getFood } from "@/features/food";
import { FamilyOrb } from "@/features/perfume/components";
import { cn } from "@/lib/utils";

const HERO_ORBS = [
  { family: "sweet", size: 150, left: "18%", top: "8%", icon: Coffee },
  { family: "green", size: 120, left: "52%", top: "0%", icon: Leaf },
  { family: "floral", size: 110, left: "38%", top: "46%", icon: Flower2 },
  { family: "citrus", size: 86, left: "70%", top: "44%", icon: Citrus },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="grid items-center gap-7 pt-4 sm:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-3.5">
          <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Scent archive</span>
          <h1 className="text-[28px] font-normal sm:text-[40px]">
            좋아하는 맛에서
            <br />
            나의 향을 찾아요
          </h1>
          <p className="max-w-[420px] text-muted-foreground">
            향수 용어를 몰라도 괜찮아요. 매일 마시는 커피, 좋아하는 디저트에 이미 당신의 취향이 들어 있어요.
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <Link href="/food" className={buttonVariants({ size: "lg" })}>
              음식으로 찾기
            </Link>
            <Link href="/expert" className={buttonVariants({ size: "lg", variant: "outline" })}>
              전문가 모드
            </Link>
          </div>
        </div>
        <div aria-hidden className="relative h-[150px] sm:h-[220px]">
          {HERO_ORBS.map((o, i) => (
            <FamilyOrb
              key={o.family}
              family={o.family}
              className="float absolute opacity-90 mix-blend-multiply"
              style={{ width: o.size, height: o.size, left: o.left, top: o.top, animationDelay: `${i * 0.8}s` }}
            >
              <o.icon className="size-[45%]" strokeWidth={1.1} />
            </FamilyOrb>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <ModeCard
          href="/food"
          title="음식으로 찾기"
          desc="음식을 고르는 즉시 공통 재료와 어울리는 향수가 나타나요"
          family="sweet"
          icon={<Coffee className="size-7" strokeWidth={1.1} />}
        />
        <ModeCard
          href="/expert"
          title="전문가 모드"
          desc="향 계열 휠에서 재료를 고르고 층과 지속 시간으로 걸러요"
          family="powder"
          icon={<FlaskConical className="size-7" strokeWidth={1.1} />}
        />
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base">이번 주 많이 찾은 조합</h2>
          <span className="text-xs text-muted-foreground">눌러서 바로 보기</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Link
              key={p.name}
              href={`/results?foods=${p.foods.join(",")}`}
              className={cn(buttonVariants({ variant: "outline" }), "h-auto gap-2 bg-card py-2")}
            >
              {p.foods.map((id) => (
                <FoodIcon key={id} name={getFood(id)!.icon} className="size-3.5" />
              ))}
              {p.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function ModeCard({
  href,
  title,
  desc,
  family,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  family: "sweet" | "powder";
  icon: React.ReactNode;
}) {
  return (
    <Card className="relative flex-row items-center gap-4 px-4 transition hover:-translate-y-0.5">
      <FamilyOrb family={family} className="size-16">
        {icon}
      </FamilyOrb>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-base">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {title}
          </Link>
        </h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
    </Card>
  );
}
