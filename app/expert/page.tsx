import { Suspense } from "react";

import { ExpertFinder } from "@/features/expert-finder";

export const metadata = { title: "전문가 모드 · 향 아카이브" };

export default function ExpertPage() {
  return (
    <Suspense>
      <ExpertFinder />
    </Suspense>
  );
}
