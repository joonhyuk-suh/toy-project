"use client";

import { Download, Link as LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

import { drawShareCard } from "./draw-card";
import type { ShareCardData } from "./draw-card";

/** 링크 복사와 이미지 저장. 복사한 링크는 같은 음식 조합을 받는 사람용 화면으로 연다. */
export function ShareActions({ foods, card }: { foods: string[]; card: Omit<ShareCardData, "background"> & { family: string } }) {
  async function copyLink() {
    const url = `${window.location.origin}/share?foods=${foods.join(",")}&view=received`;
    try {
      await navigator.clipboard.writeText(url);
      toast.add({ title: "공유 링크를 복사했어요", type: "success" });
    } catch {
      toast.add({ title: "링크를 복사하지 못했어요", description: url, type: "error" });
    }
  }

  async function saveImage() {
    try {
      const background = getComputedStyle(document.documentElement).getPropertyValue(`--fam-${card.family}`).trim();
      const blob = await drawShareCard({ ...card, background });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "내-입맛-향수.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      toast.add({ title: "이미지를 저장했어요", type: "success" });
    } catch {
      toast.add({ title: "이미지를 저장하지 못했어요", type: "error" });
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="lg" className="flex-1" onClick={copyLink}>
        <LinkIcon data-icon="inline-start" />
        링크 복사
      </Button>
      <Button size="lg" variant="outline" className="flex-1" onClick={saveImage}>
        <Download data-icon="inline-start" />
        이미지로 저장
      </Button>
    </div>
  );
}
