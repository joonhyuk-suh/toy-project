"use client";

import { useEffect } from "react";

import { useArchive } from "./use-archive";
import type { SearchKind } from "./store";

/** 화면에 결과가 보이면 "최근에 찾은 것"에 기록한다. 보이는 것은 없다. */
export function RecordSearch({ kind, items }: { kind: SearchKind; items: string[] }) {
  const { record } = useArchive();
  const key = items.join(",");
  useEffect(() => {
    if (!key) return;
    const t = setTimeout(() => record(kind, key.split(",")), 600);
    return () => clearTimeout(t);
    // record는 매 렌더 새 함수지만 하는 일은 같다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, key]);
  return null;
}
