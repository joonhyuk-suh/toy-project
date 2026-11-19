"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useArchive } from "./use-archive";

/** 관심 향수에 담고 빼는 하트. icon은 목록용 둥근 버튼, full은 상세용 큰 버튼. */
export function WishButton({ slug, variant = "icon" }: { slug: string; variant?: "icon" | "full" }) {
  const { archive, toggleWish } = useArchive();
  const on = archive.wish.includes(slug);
  if (variant === "full") {
    return (
      <Button
        size="lg"
        variant={on ? "default" : "outline"}
        aria-pressed={on}
        onClick={() => toggleWish(slug)}
        className="w-full max-w-60"
      >
        <Heart data-icon="inline-start" className={on ? "fill-current" : undefined} />
        {on ? "관심 향수에 담겼어요" : "관심 향수에 담기"}
      </Button>
    );
  }
  return (
    <Button
      size="icon-lg"
      variant={on ? "default" : "outline"}
      aria-pressed={on}
      aria-label={on ? "관심 향수에서 빼기" : "관심 향수에 담기"}
      onClick={() => toggleWish(slug)}
    >
      <Heart className={on ? "fill-current" : undefined} />
    </Button>
  );
}
