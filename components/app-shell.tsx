"use client";

import { BottleWine, Coffee, Compass, FlaskConical, Sprout } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const MENU = [
  { href: "/", label: "홈", short: "홈", icon: Compass },
  { href: "/food", label: "음식으로 찾기", short: "음식", icon: Coffee },
  { href: "/expert", label: "전문가 모드", short: "전문가", icon: FlaskConical },
  { href: "/me", label: "나의 향", short: "나의 향", icon: Sprout },
] as const;

// 결과·공유 화면은 음식으로 찾기 흐름의 일부라서 같은 메뉴를 켠다.
function activeHref(pathname: string): string | null {
  if (pathname === "/") return "/";
  if (pathname.startsWith("/food") || pathname.startsWith("/results") || pathname.startsWith("/share")) return "/food";
  if (pathname.startsWith("/expert")) return "/expert";
  if (pathname.startsWith("/me")) return "/me";
  return null;
}

/** 모든 화면의 공통 shell: 상단 메뉴(넓은 화면), 하단 탭 메뉴(640px 미만), 내용 폭과 좌우 여백. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const active = activeHref(usePathname());
  return (
    <>
      <header className="mx-auto flex w-full max-w-[1120px] items-center gap-6 border-b px-4 pt-4 pb-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg">
          <BottleWine className="size-[22px]" strokeWidth={1.3} aria-hidden />
          향 아카이브
        </Link>
        <nav aria-label="주요 메뉴" className="ml-auto hidden gap-1 sm:flex">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              aria-current={active === m.href ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground",
                active === m.href && "bg-secondary text-foreground",
              )}
            >
              {m.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-5 px-4 pt-5 pb-28 sm:px-6 sm:pb-12">
        {children}
      </main>
      <nav
        aria-label="하단 탭 메뉴"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background pt-2 pb-3 sm:hidden"
      >
        {MENU.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            aria-current={active === m.href ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 text-[11px] text-muted-foreground",
              active === m.href && "text-foreground",
            )}
          >
            <m.icon className="size-5" strokeWidth={1.3} aria-hidden />
            {m.short}
          </Link>
        ))}
      </nav>
    </>
  );
}
